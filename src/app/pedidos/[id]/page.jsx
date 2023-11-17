"use client"

import { useState,useEffect } from 'react'
import { useFetchId } from '@/components/hooks/useFetchId'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useFetch } from '@/components/hooks/useFetch'
import { v4 as uuid } from 'uuid'
import { AiOutlinePlus } from 'react-icons/ai'
import PlatePresentation from '@/components/plate-presentation'
import Plate from '@/components/plate'

export default function Pedidos({ params }) {
    const { data:session } = useSession()
    const router = useRouter()

    const [showInfo,setShowInfo] = useState(true);
    const [showPopupCategories,setPopupCategories] = useState(false)
    const [allPlates,setAllPlates] = useState([])
    const [cantProducts,setCantProducts] = useState()
    const [price,setPrice] = useState()
    const { dataId,isLoadingId,errorId } = useFetchId("http://localhost:5000/pedidos",params.id)
    const { data,isLoading,error } = useFetch("http://localhost:5000/platos")

    const item = localStorage.getItem("Order");
    const order = JSON.parse(item)

    const closeOperation = ()=> {
        order.idOrder = ''
        localStorage.setItem("Order",JSON.stringify(order));
        setShowInfo(false)
    }

    const setPlate = async(evt,itemCategory)=> {
        evt.preventDefault()

        order.categoria = itemCategory
        order.id = uuid()

        try {
            const response = await fetch("http://localhost:5000/platos", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(order)
            }).then(res => res.json());
            console.log(response)
            setAllPlates([...allPlates,response]);
        } catch(err) {
            console.error(err);
        }

        setPopupCategories(false)
        closeOperation()
    }

    const getPlates = ()=> {
        if (error) {
            const arrayElements = data.filter(item => item.idOrder === params.id)
            arrayElements.sort((a, b) => {
                if (a.categoria === 'Plato principal') {
                    return -1
                }
                if (b.categoria === 'Plato secundario') {
                    return 0
                }
                if (a.categoria === 'Postre') {
                    return 1
                }
            })
            setAllPlates(arrayElements)
        }
        else {
            console.log("No se pudieron resivir los platos.")
        }
    }

    const getValues = ()=> {
        let sum = 0
        let cantProds = 0
        allPlates.forEach((item)=> {
            sum += parseInt(item.price)
            cantProds += 1
        })
        setPrice(sum)
        setCantProducts(cantProds)
    }

    useEffect(()=> {
        if(!errorId) {
            console.log("Ha ocurrido un error.")
        }
        getPlates()
    },[data])
    
    useEffect(()=> {
        getValues()
    },[getValues])

    return (
        <>
            <div className="w-[110%] h-[550px] bg-[#76ed78] rounded-b-[50%] top-[-100px] left-[-5%] absolute z-0"></div>
            <div className="z-20 p-28 pt-14 relative">
                <div className='w-full flex flex-col items-center'>
                    <div className="w-[$610px]">
                        <h2 className="text-2xl w-[610px]">
                            {isLoadingId ? 'Loading...' : dataId.name}</h2>
                        <h3>
                            {
                                (session?.user.name == undefined) ? 
                                'Loading...' :  
                                session?.user.name + ' ' + session?.user.lastName
                            }
                        </h3>

                        <div className={`flex w-full justify-center flex-col mt-10
                        ${params.id === order.idOrder && showInfo  ? '' : 'hidden' }`}>
                            <PlatePresentation />
                            <div className='flex justify-between mt-14'>
                                <button className="bg-[#3ea440] transition duration-[0.3s] hover:bg-[#348935]
                                w-[45%] p-2 text-xl rounded-full shadow-[0_2px_4px_#a9a9a9] text-white"
                                onClick={()=> setPopupCategories(true)}>
                                    Añadir al pedido
                                </button>

                                <button className="bg-white transition duration-[0.3s] hover:bg-red-300
                                w-[45%] p-2 text-xl rounded-full shadow-[0_2px_4px_#a9a9a9] text-black"
                                onClick={closeOperation}>
                                    Cancelar operación
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full pt-14 flex-col">
                        <h2 className="text-xl">Detalles del pedido</h2>
                        <div className="grid grid-cols-3 gap-14 mt-9">
                            {
                                isLoading ?
                                'Loading...' :
                                allPlates.map((item) => (
                                    <Plate 
                                        key={item.id}
                                        nombre={item.nombre} 
                                        precio={item.price} 
                                        categoria={item.categoria}
                                        imagen={item.imagen}
                                        id={item.id}
                                    />
                                ))
                            }

                            <button className="flex p-4 bg-white shadow-[0_0_10px_#a9a9a9] rounded-xl"
                            onClick={()=> {
                                router.push('/')
                            }}>
                                <div className="flex w-[40%] flex-col justify-between">
                                    <h3>Añadir Articulo</h3>
                                </div>
                                
                                <div className='flex w-[60%] h-[120px] relative justify-center'>
                                    <AiOutlinePlus className='w-full h-full text-[#a3a3a3]' />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className='flex mt-14'>
                    <div className='flex'>
                        <h2>Cantidad de productos:</h2><h2 className='text-[#3da443] ml-2'>{cantProducts}</h2>
                    </div>
                    <div className='flex ml-14'>
                        <h2>Valor del pedido:</h2><h2 className='text-[#3da443] ml-2'>${price}</h2>
                    </div>
                </div>

                <div className='flex'>
                    <div className='my-14 mr-4'>
                        <button className="bg-[#3ea440] transition duration-[0.3s] hover:bg-[#348935]
                            w-[100%] p-1 px-10 text-lg rounded-full shadow-[0_2px_4px_#a9a9a9] text-white"
                            onClick={() => {
                                alert("Tu pedido sera enviado, muchas gracias por comprar!")
                                router.push("/")
                            }}>
                            Enviar pedido
                        </button>
                    </div>

                    <div className='my-14 ml-4'>
                        <button className="bg-red-300 transition duration-[0.3s] hover:bg-red-400
                            w-[100%] p-1 px-10 text-lg rounded-full shadow-[0_2px_4px_#a9a9a9] text-black"
                            onClick={()=> {
                                closeOperation()
                                router.push("/")
                            }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            <div className={`fixed top-0 lef-0 w-full h-full ${showPopupCategories ? '' : 'hidden'} flex
            justify-center items-center backdrop-blur-[2px] transition z-50`}>
                <button className="z-50 absolute top-0 right-0 m-10 p-4 bg-red-600 text-white rounded-xl"
                onClick={() => setPopupCategories(false)}>
                    X
                </button>

                <button className={`z-50 w-52 h-52 p-2 m-10 bg-white shadow-[0_0_20px_#a9a9a9] rounded-2xl hover:scale-105
                transition`} onClick={(evt)=> setPlate(evt,"Plato principal")}>
                    Plato principal
                </button>

                <button className={`z-50 w-52 h-52 p-2 m-10 bg-white shadow-[0_0_20px_#a9a9a9] rounded-2xl hover:scale-105
                transition`} onClick={(evt)=> setPlate(evt,"Plato secundario")}>
                    Plato secundario
                </button>

                <button className={`z-50 w-52 h-52 p-2 m-10 bg-white shadow-[0_0_20px_#a9a9a9] rounded-2xl hover:scale-105
                transition`} onClick={(evt)=> setPlate(evt,"Bebida")}>
                    Bebida
                </button>

                <button className={`z-50 w-52 h-52 p-2 m-10 bg-white shadow-[0_0_20px_#a9a9a9] rounded-2xl hover:scale-105
                transition`} onClick={(evt)=> setPlate(evt,"Postre")}>
                    Postre
                </button>

                <div className="w-full h-full absolute z-0" onClick={()=> setPopupCategories(false)}></div>
            </div>
        </>
    )
}
