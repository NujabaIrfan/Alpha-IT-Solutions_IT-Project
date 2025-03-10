import React from 'react'
import Hero from '../components/Hero'
import CompanyLogo from '../components/CompanyLogo'
import FeaturesSection from '../components/FeaturesSection'
import DesignSection from '../components/DesignSection'
import CustomerSection from '../components/CustomerSection'
import About from '../components/About'
import TryNow from '../components/TryNow'
import TrendingProducts from '../shop/TrendingProducts'

const Home = () => {
  return (
    <>
     <Hero />
     <CompanyLogo />
     <FeaturesSection />
     <TrendingProducts/>
     <DesignSection />
     <CustomerSection />
     <About />
     <TryNow />
    </>
  )
}

export default Home;