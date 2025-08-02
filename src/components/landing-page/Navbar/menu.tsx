"use client"
import { Card, CardContent } from '@/components/ui/card'
import { useNavigation } from '@/hooks/navigation'
import React from 'react'


type MenuProps = {
  orientation : "desktop" | "mobile"
}


const Menu = (props: MenuProps) => {
    const {section , onSetSection} = useNavigation()
    switch (props.orientation){
        case "desktop":
            return (
                <Card className='bg-gray-700 border-gray-400 bg-clip-padding backdrop-blur-2xl p-1 lg:flex hidden rounded-xl'
                >
                    <CardContent className='p-0 flex gap-2'>
                        
                    </CardContent>
                    
                </Card>
            )
        case "mobile":
            return <div>Mobile Menu</div>
        default:
            return <div>Desktop Menu</div>
    }
}

export default Menu
