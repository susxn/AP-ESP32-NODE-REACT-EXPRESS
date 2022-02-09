import axios from 'axios';
import { useEffect, useState } from 'react';


const Historic = () => {

    const [history, setHistory] = useState([]);
    

    useEffect(() => {
        const interval = setInterval(() => {

            axios
                .get('http://localhost:4001/api/mac/historic', {
                })
                .then(res => {
                    setHistory(res.data)
                })
                .catch(error => console.error('Error: ${error}'))

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const clearHistoric = () => {

        axios
            .get('http://localhost:4001/api/mac/delete/historic')
            .then(() => {
                setHistory([]);
            })
            .catch(error => console.error(`Error: ${error}`))

    }





    return (
        <>

            <div class="p-4">
                <div class="bg-white p-4 rounded-md">
                    <div>
                        <div>
                            <div>

                                <button className="w-1/5 flex shadow 0 hover:bg-green-500 font-bold text-white bg-green-400 py-2 mt-10 mb-10 px-4 rounded" onClick={() => clearHistoric()}>
                                    <p className="text-center w-full">
                                        Clear
                                    </p>
                                </button>

                                <table  >
                                    <thead >
                                        <tr >
                                            <th>
                                                TIME
                                            </th>
                                            <th>
                                                MAC
                                            </th>
                                            <th>
                                                AID
                                            </th>
                                            <th>
                                                ACTION
                                            </th>
                                           
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            Object.keys(history.reverse()).map((item, i) => (

                                                <tr class="border-b border-gray-200 hover:bg-gray-200" key={i}>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {history[item].time}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {history[item].mac}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {history[item].aid}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {history[item].action}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Historic

