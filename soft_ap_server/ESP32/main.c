#include <string.h>
#include <time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_wpa2.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "driver/gpio.h"
#include "lwip/opt.h"
#include "esp_http_client.h"
#if IP_NAPT
#include "lwip/lwip_napt.h"
#endif

#include "lwip/err.h"
#include "lwip/sys.h"

#define MY_DNS_IP_ADDR 0x08080808 // 8.8.8.8

// WIFI CONFIGURATION
#define ESP_AP_SSID CONFIG_ESP_AP_SSID
#define ESP_AP_PASS CONFIG_ESP_AP_PASSWORD

#define EXAMPLE_ESP_WIFI_SSID CONFIG_STA_SSID
#define EXAMPLE_ESP_WIFI_PASS CONFIG_STA_PASSWORD

#define delay_ms(ms) vTaskDelay(ms / portTICK_RATE_MS)

#define EXAMPLE_ESP_MAXIMUM_RETRY 3
#define HTTP_TAG "HTTP"

/* FreeRTOS event group to signal when we are connected*/
static EventGroupHandle_t s_wifi_event_group;
static xSemaphoreHandle mutex;

/* The event group allows multiple bits for each event, but we only care about one event
 * - are we connected to the AP with an IP? */
const int WIFI_CONNECTED_BIT = BIT0;

static const char *TAG = "ESP-32";

static int s_retry_num = 0;

esp_err_t _http_event_handle(esp_http_client_event_t *evt);
void send_http_sta_connected(uint8_t *mac, uint8_t aid);

void delay(int number_of_seconds)
{
  // Converting time into milli_seconds
  int milli_seconds = 1000 * number_of_seconds;

  // Storing start time
  clock_t start_time = clock();

  // looping till required time is not achieved
  while (clock() < start_time + milli_seconds)
    ;
}

void deleteMac(char *txt)
{
  char aid[2];
  if (strlen(txt) > 5)
  {
    printf("From delete mac: %s", txt);
    strncpy(aid, &txt[3],2);
    aid[2]='\0';
    printf("aid: %s", aid);
    esp_wifi_deauth_sta(atoi(aid));
  }
}

void send_http_sta_disconnected(uint8_t *mac, uint8_t aid)
{
  char post_data[50] = "{\"mac\": \"";
  strcat(post_data, ((char *)mac));

  char aid_str[4];
  sprintf(aid_str, "%d", aid);
  char aid_field[50] = "\",\"aid\": \"";
  strcat(aid_field, aid_str);

  char action_field[50] = "\",\"action\": ";
  strcat(action_field, "\"leave\" }");
  strcat(post_data, aid_field);
  strcat(post_data, action_field);
  printf(" %s ", post_data);

  esp_http_client_config_t config = {
      .url = "http://192.168.1.47:4001/api/mac/esp/action",
  };
  esp_http_client_handle_t client = esp_http_client_init(&config);
  esp_http_client_set_method(client, HTTP_METHOD_POST); //HTTP_METHOD_GET
  esp_http_client_set_post_field(client, post_data, strlen(post_data));
  esp_http_client_set_header(client, "Content-Type", "application/json");

  esp_err_t err = esp_http_client_perform(client);

  if (err == ESP_OK)
  {
    printf("Status = %d, content_length = %lld",
           esp_http_client_get_status_code(client),
           esp_http_client_get_content_length(client));
  }
  xSemaphoreGive(mutex);
  esp_http_client_cleanup(client);
}

void HandleWiFiStationConnected(system_event_info_t info)
{

  printf("New Station connected with AID: %02x and MAC: ", info.sta_connected.aid);

  uint8_t mac[18];
  snprintf((char *)mac, sizeof(mac), "%02x:%02x:%02x:%02x:%02x:%02x",
           info.sta_connected.mac[0], info.sta_connected.mac[1], info.sta_connected.mac[2], info.sta_connected.mac[3], info.sta_connected.mac[4], info.sta_connected.mac[5]);

  printf("%s", mac);
  printf("\n");

  send_http_sta_connected(mac, info.sta_connected.aid);

  //esp_wifi_deauth_sta(info.sta_connected.aid);
}

void HandleWiFiStationDisconnected(system_event_info_t info)
{
  printf(" Station Disconnected with AID: %02x and MAC: ", info.sta_connected.aid);

  uint8_t mac[18];
  snprintf((char *)mac, sizeof(mac), "%02x:%02x:%02x:%02x:%02x:%02x",
           info.sta_connected.mac[0], info.sta_connected.mac[1], info.sta_connected.mac[2], info.sta_connected.mac[3], info.sta_connected.mac[4], info.sta_connected.mac[5]);

  printf("%s", mac);
  printf("\n");

  send_http_sta_disconnected(mac, info.sta_connected.aid);
}

esp_err_t _http_event_handle(esp_http_client_event_t *evt)
{

  switch (evt->event_id)
  {
  case HTTP_EVENT_ERROR:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_ERROR");
    break;

  case HTTP_EVENT_ON_CONNECTED:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_ON_CONNECTED");
    break;

  case HTTP_EVENT_HEADER_SENT:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_HEADER_SENT");
    break;

  case HTTP_EVENT_ON_HEADER:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_ON_HEADER");
    printf("%.*s", evt->data_len, (char *)evt->data);
    break;

  case HTTP_EVENT_ON_DATA:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);
    char txt[20];
    sprintf(txt, "%.*s", evt->data_len, (char *)evt->data);
    ESP_LOGI(HTTP_TAG, "Grabbed text, %s", txt);
    deleteMac(txt);
    break;

  case HTTP_EVENT_ON_FINISH:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_ON_FINISH");
    break;

  case HTTP_EVENT_DISCONNECTED:
    ESP_LOGI(HTTP_TAG, "HTTP_EVENT_DISCONNECTED");
    break;
  }
  return ESP_OK;
}

esp_err_t event_handler(void *ctx, system_event_t *event)
{
  switch (event->event_id)
  {
  case SYSTEM_EVENT_STA_START:
    esp_wifi_connect();
    break;
  case SYSTEM_EVENT_STA_GOT_IP:
    ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->event_info.got_ip.ip_info.ip));
    s_retry_num = 0;
    xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    break;
  case SYSTEM_EVENT_STA_DISCONNECTED:
  {
    if (s_retry_num < EXAMPLE_ESP_MAXIMUM_RETRY)
    {
      esp_wifi_connect();
      xEventGroupClearBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
      s_retry_num++;
      ESP_LOGI(TAG, "retry to connect to the AP");
    }
    ESP_LOGI(TAG, "connect to the AP failed");
    break;
  }

  case SYSTEM_EVENT_AP_STACONNECTED:;
    if (xSemaphoreTake(mutex, portMAX_DELAY) == pdTRUE)
    {
      HandleWiFiStationConnected(event->event_info);
    }
    break;

  case SYSTEM_EVENT_AP_STADISCONNECTED:
    if (xSemaphoreTake(mutex, portMAX_DELAY) == pdTRUE)
    {
      HandleWiFiStationDisconnected(event->event_info);
    }
    break;
  default:
    break;
  }
  return ESP_OK;
}

void send_http_sta_connected(uint8_t *mac, uint8_t aid)
{
  char response_data[100];
  char post_data[50] = "{\"mac\": \"";
  strcat(post_data, ((char *)mac));

  char aid_str[4];
  sprintf(aid_str, "%d", aid);
  char aid_field[50] = "\",\"aid\": \"";
  strcat(aid_field, aid_str);

  char action_field[50] = "\",\"action\": ";
  strcat(action_field, "\"join\" }");
  strcat(post_data, aid_field);
  strcat(post_data, action_field);

  printf(" %s ", post_data);

  esp_http_client_config_t config = {
      .url = "http://192.168.1.47:4001/api/mac/esp/action"};
  esp_http_client_handle_t client = esp_http_client_init(&config);
  esp_http_client_set_method(client, HTTP_METHOD_POST); //HTTP_METHOD_GET
  esp_http_client_set_post_field(client, post_data, strlen(post_data));
  esp_http_client_set_header(client, "Content-Type", "application/json");

  esp_err_t err = esp_http_client_perform(client);

  if (err == ESP_OK)
  {
    printf("Status = %d, content_length = %lld",
           esp_http_client_get_status_code(client),
           esp_http_client_get_content_length(client));
  }
  xSemaphoreGive(mutex);
  esp_http_client_cleanup(client);
}

void wifi_init_sta(void)
{
  ip_addr_t dnsserver;
  //tcpip_adapter_dns_info_t dnsinfo;

  s_wifi_event_group = xEventGroupCreate();

  tcpip_adapter_init();
  ESP_ERROR_CHECK(esp_event_loop_init(event_handler, NULL));

  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  ESP_ERROR_CHECK(esp_wifi_init(&cfg));

  /* ESP STATION CONFIG */
  wifi_config_t wifi_config = {
      .sta = {
          .ssid = EXAMPLE_ESP_WIFI_SSID,
          .password = EXAMPLE_ESP_WIFI_PASS},
  };

  /* ESP AP CONFIG */
  wifi_config_t ap_config = {
      .ap = {
          .ssid = ESP_AP_SSID,
          .channel = 0,
          .authmode = WIFI_AUTH_WPA2_PSK,
          .password = ESP_AP_PASS,
          .ssid_hidden = 0,
          .max_connection = 8,
          .beacon_interval = 100}};

  ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
  ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
  ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_AP, &ap_config));

  // Enable DNS (offer) for dhcp server
  dhcps_offer_t dhcps_dns_value = OFFER_DNS;
  dhcps_set_option_info(6, &dhcps_dns_value, sizeof(dhcps_dns_value));

  // Set custom dns server address for dhcp server
  dnsserver.u_addr.ip4.addr = htonl(MY_DNS_IP_ADDR);
  dnsserver.type = IPADDR_TYPE_V4;
  dhcps_dns_setserver(&dnsserver);

  //tcpip_adapter_get_dns_info(TCPIP_ADAPTER_IF_AP, TCPIP_ADAPTER_DNS_MAIN, &dnsinfo);
  //ESP_LOGI(TAG, "DNS IP:" IPSTR, IP2STR(&dnsinfo.ip.u_addr.ip4));

  ESP_ERROR_CHECK(esp_wifi_start());

  ESP_LOGI(TAG, "wifi_init_apsta finished.");
  ESP_LOGI(TAG, "connect to ap SSID: %s ",
           EXAMPLE_ESP_WIFI_SSID);
}

void inform_http_task(void *args)
{
  while (1)
  {
    if (xSemaphoreTake(mutex, portMAX_DELAY) == pdTRUE)
    {
      esp_http_client_config_t config = {
          .url = "http://192.168.1.47:4001/api/mac/esp/inform",
          .event_handler = _http_event_handle,
          .buffer_size = 1024,
      };
      esp_http_client_handle_t client = esp_http_client_init(&config);
      esp_err_t err = esp_http_client_perform(client);
      if (err == ESP_OK)
      {
        printf("Periodic Inform Status = %d, content_length = %lld",
               esp_http_client_get_status_code(client),
               esp_http_client_get_content_length(client));
      }

      esp_http_client_cleanup(client);
      xSemaphoreGive(mutex);
    }
    delay_ms(2 * 1000);
  }
}

void app_main()
{
  // Initialize NVS
  esp_err_t ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
  {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  // Setup WIFI
  wifi_init_sta();
  mutex = xSemaphoreCreateMutex();
  xTaskCreate(inform_http_task, "Check BlackList Macs", 4096, NULL, configMAX_PRIORITIES, NULL);

#if IP_NAPT
  u32_t napt_netif_ip = 0xC0A80401; // Set to ip address of softAP netif (Default is 192.168.4.1)
  ip_napt_enable(htonl(napt_netif_ip), 1);
  ESP_LOGI(TAG, "NAT is enabled");
#endif
}
