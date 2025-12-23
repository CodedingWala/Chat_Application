import React from 'react'
import {LoaderIcon} from "lucide-react"

function PageLoad() {
  return (
    <div className=' flex justify-center items-center h-screen'>
        <LoaderIcon className='size-10 animate-spin'/>
    </div>
  )
}

export default PageLoad
