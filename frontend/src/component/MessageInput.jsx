import React, { useEffect, useRef, useState } from 'react'
import UseKeyboardSound from '../hooks/randomSound'
import { useChatStore } from '../Store/useChatStore'
import { ImageIcon, SendIcon, XIcon } from 'lucide-react'


function MessageInput() {
  const { keyStrokeSound } = UseKeyboardSound()
  const { IsSoundeEnabled, sendMesage } = useChatStore()
  const [text, settext] = useState("")
  const [Imagepreviwe, setImagepreviwe] = useState(null)
  const InputRef = useRef(null)

  const submitHandler = (e) => {
    e.preventDefault()
    if (!text.trim() && !Imagepreviwe) {
      return
    }
    if (IsSoundeEnabled) {
      keyStrokeSound()
    }
    sendMesage({
      text: text.trim(),
      image: Imagepreviwe
    })
    settext("")
    setImagepreviwe(null)
    if (InputRef.current) {
      InputRef.current.value = ""
    }

  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagepreviwe(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagepreviwe(null)
    InputRef.current.value = ""

  }

  return (
    <div className='justify-self-end p-4 border-t border-slate-700/50 z-10'>
      {
        Imagepreviwe &&
        <div className='max-w-3xl m-auto mb-3 flex justify-start '>
          <div className='relative '>
            <img src={Imagepreviwe} alt="loadeed image" className='h-40  w-40 rounded-lg object-fit border border-slate-700  justify-self-start' />
            <button onClick={removeImage} className='absolute top-2 right-2  bg-gslate-800 w-6 h-6  p-1 rounded-full text-white  flex  justify-center items-center hover:bg-slate-700'>
              <XIcon className='w-4 h-4' />
            </button>
          </div>
        </div>
      }

      <form onSubmit={submitHandler} className='max-w-3xl lg:mx-auto md:mx-auto mx-1 flex  md:space-x-4 lg:space-x-4 space-x-2'>
        <input type="text"
          onChange={(e) => {
            settext(e.target.value)
            if (IsSoundeEnabled) {
              keyStrokeSound()
            }
          }}
          value={text}
          className='flex-1 rounded-lg bg-slate-700 border border-slate-700/50 px-4 py-2 outline-none text-white'
          placeholder='Type a message'
          ref={InputRef}
        />

        <input type="file"
          onChange={handleImageChange}
          className='hidden'
          ref={InputRef}
          accept="image/*"  
        />
        <button
          type='button'
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 px-4 rounded-lg ${Imagepreviwe ? "text-cyan-500" : ""}`}
          onClick={() => InputRef.current?.click()}
        >
          <ImageIcon className='w-5 h-5' />
        </button>


        <button
          type="submit"
          disabled={!text.trim() && !Imagepreviwe}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>

    </div>

  )
}

export default MessageInput
