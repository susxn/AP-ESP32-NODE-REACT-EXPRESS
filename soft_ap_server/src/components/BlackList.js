import axios from 'axios';
import { useEffect, useState } from 'react';


const BlackList = () => {

    const [blacklist, setBlackList] = useState([]);

    const [mac, setMac] = useState("");
    const [time_zone, setTimeZone] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");



    useEffect(() => {
        const interval = setInterval(() => {

            axios
                .get('http://localhost:4001/api/mac/blacklist', {
                })
                .then(res => {
                    setBlackList(res.data)
                })
                .catch(error => console.error('Error: ${error}'))

        }, 1000);
        return () => clearInterval(interval);
    }, []);


    const handleSend = () => {

        axios
            .post('http://localhost:4001/api/mac/filter/addmac', {

                mac: mac,
                time_zone: time_zone,
                from: from,
                to: to
            })
            .then(() => {
                setMac("");
                setTimeZone("");
                setFrom("");
                setTo("");
            })
            .catch(error => console.error(`Error: ${error}`))

    }

    const handleDelete = () => {

        axios
            .post('http://localhost:4001/api/mac/filter/deletemac', {
                mac : mac,

            })
            .then(() => {
                setMac("");
                setTimeZone("");
                setFrom("");
                setTo("");
            })
            .catch(error => console.error(`Error: ${error}`))

    }
    const clearBlacklist = () => {

        axios
            .get('http://localhost:4001/api/mac/delete/blacklist')
            .then(() => {
                setMac("");
                setTimeZone("");
                setFrom("");
                setTo("");
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


                                <input className="shadow tracking-wide py-2 px-4 mb-5 leading-relaxed  appearance-none block w-full bg-white  rounded focus:outline-none focus:bg-white focus:border-gray-500" type="email" placeholder="MAC" value={mac} onChange={(e) => { setMac(e.target.value) }} />
                                <label htmlFor="name" className="absolute w-full tracking-wide py-2 px-4 mb-4 opacity-0 leading-tight block top-0 left-0 cursor-text"></label>

                                <input className="shadow tracking-wide py-2 px-4 mb-5 leading-relaxed  appearance-none block w-full bg-white  rounded focus:outline-none focus:bg-white focus:border-gray-500" type="email" placeholder="TimeZone" value={time_zone} onChange={(e) => { setTimeZone(e.target.value) }} />
                                <label htmlFor="name" className="absolute w-full tracking-wide py-2 px-4 mb-4 opacity-0 leading-tight block top-0 left-0 cursor-text"></label>

                                <input className="shadow tracking-wide py-2 px-4 mb-5 leading-relaxed  appearance-none block w-full bg-white  rounded focus:outline-none focus:bg-white focus:border-gray-500" type="email" placeholder="From" value={from} onChange={(e) => { setFrom(e.target.value) }} />
                                <label htmlFor="name" className="absolute w-full tracking-wide py-2 px-4 mb-4 opacity-0 leading-tight block top-0 left-0 cursor-text"></label>

                                <input className="shadow tracking-wide py-2 px-4 mb-5 leading-relaxed  appearance-none block w-full bg-white  rounded focus:outline-none focus:bg-white focus:border-gray-500" type="email" placeholder="To" value={to} onChange={(e) => { setTo(e.target.value) }} />
                                <label htmlFor="name" className="absolute w-full tracking-wide py-2 px-4 mb-4 opacity-0 leading-tight block top-0 left-0 cursor-text"></label>



                                <div className="flex flex-row mt-10 mb-10 items-center grid-2 gap-5">
                                    <button className="w-1/2 flex shadow 0 hover:bg-blue-500 font-bold text-white bg-blue-400 py-2 px-4 rounded" onClick={() => handleSend()}>
                                        <p className="text-center w-full">
                                            Add
                                        </p>
                                    </button>
                                    
                                    <button className="w-1/2 flex shadow 0 hover:bg-green-500 font-bold text-white bg-green-400 py-2 px-4 rounded" onClick={() => clearBlacklist()}>
                                        <p className="text-center w-full">
                                            Clear
                                        </p>
                                    </button>

                                    <button className="w-1/2 flex shadow 0 hover:bg-red-500 font-bold text-white bg-red-400 py-2 px-4 rounded" onClick={() => handleDelete()}>
                                        <p className="text-center w-full">
                                            Delete
                                        </p>
                                    </button>

                                </div>



                                <table  >
                                    <thead >
                                        <tr >
                                            <th>
                                                MAC
                                            </th>
                                            <th>
                                                TIME_ZONE
                                            </th>
                                            <th>
                                                FROM
                                            </th>
                                            <th>
                                                TO
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            Object.keys(blacklist).map((item, i) => (

                                                <tr class="border-b border-gray-200 hover:bg-gray-200" key={i}>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {blacklist[item].mac}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {blacklist[item].time_zone}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {blacklist[item].from}
                                                    </td>

                                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                                        {blacklist[item].to}
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

export default BlackList

