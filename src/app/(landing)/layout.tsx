

import React from 'react'

const HomePageLayout = async({children} : {children : React.ReactNode}) => {

  return (
    <main className='bg-black'>
      {children}
    </main>
  )
}

export default HomePageLayout