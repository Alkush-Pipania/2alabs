"use client"

import InputBox from "./InputBox"

export default function Chatcomponent(){
    return (
        <div className="w-full flex flex-col h-full overflow-hidden">
        <div
        // ref={chatContainerRef}
        className={`flex-1  overflow-y-auto mb-44 hide-scrollbar pb-8 px-6 max-w-[800px] mx-auto w-full relative transition-all duration-500`}>
            {/* messages and loading */}
        </div>
        <InputBox
        id={"x"}
        onSendMessage={async (message: string) => {
            console.log(message)
        }}
        greeting={"Hello!"}
        hasMessages={false}
        />
        </div>
    )
}