import { NavLink } from "react-router-dom";


export default function Navbar() {
    return (
        <>


            <div class="flex flex-wrap place-items-center ">
                <nav class="flex justify-between bg-gradient-to-tr from-indigo-600 to-purple-600 text-white w-screen">
                    <div class="px-5 xl:px-12 py-6 flex w-full items-center">
                        <ul class="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
                            <li>
                                <NavLink className="text-2xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase" to="/">
                                    Historic
                                </NavLink>

                            </li>

                            <li>
                                <NavLink className="text-2xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase" to="/blacklist">
                                    Blacklist
                                </NavLink>
                            </li>
                        </ul>

                    </div>
                </nav>

            </div>

        </>
    )
};
