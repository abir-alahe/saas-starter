import Footer from '@/components/section/layout/footer/Footer';
import Navbar from '@/components/section/layout/navbar/Navbar';
import HomeHero from '@/components/section/static/hero/home/HomeHero';
import React from 'react'

const TestPage = () => {
  return (
    <>
      <Navbar variant="primary" />
      <HomeHero/>
      <Footer />
    </>
  );
}

export default TestPage
