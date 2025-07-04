

import React from 'react'

const HomePageLayout = async({children} : {children : React.ReactNode}) => {

  return (
    <main>
      {children}
    </main>
  )
}

export default HomePageLayout