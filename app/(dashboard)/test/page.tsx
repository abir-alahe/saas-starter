import Footer from '@/components/section/layout/footer/Footer';
import Navbar from '@/components/section/layout/navbar/Navbar';
import HomeHero from '@/components/section/static/hero/home/HomeHero';
import Testimonials from '@/components/section/static/testimonials/Testimonials';
import React from 'react'

const TestPage = () => {
  return (
    <>
      <Navbar variant="primary" />
      <HomeHero/>
      <Testimonials/>
      <Footer />
    </>
  );
}

export default TestPage
