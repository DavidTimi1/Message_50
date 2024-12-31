
import './page.css';

import React, { useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { ProdName } from '../App';
import Navbar from './Navbar';


const LandingPage = () => {
    const [scroll, setScroll] = useState(false);

    return (
        <div className='max' onScroll={handleScroll}>

            <Navbar scroll={scroll} />

            <div className="landing-page">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                <h1 className="hero-title">{ ProdName }</h1>
                <p className="hero-tagline">
                    Quick, Secure and Seamless Messaging Platform
                </p>
                <Link to="/register" className="my-btn no-link br-5">
                    <div className="btn-bg">
                        <div className="btn max">
                            Get Started
                        </div>
                    </div>
                </Link>
                </div>
            </header>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Why Choose { ProdName }?</h2>
                <div className="feature-cards">
                <div className="feature-card">
                    <h3>🔒 End-to-End Encryption</h3>
                    <p>Your messages stay private—always.</p>
                </div>
                <div className="feature-card">
                    <h3>🌍 Cross-Platform</h3>
                    <p>Access your chats anytime, anywhere.</p>
                </div>
                <div className="feature-card">
                    <h3>⚡ Lightning Fast</h3>
                    <p>Instant delivery with cutting-edge technology.</p>
                </div>
                </div>
            </section>

            <Footer />
            </div>
            
        </div>
    );

    function handleScroll(e){
        const isScrolling = e.target.scrollHeight > 10;

        if (isScrolling != scroll){
            setScroll(isScrolling);
        }
    }
};

export default LandingPage;




const Footer = () => {
	return (
		<footer className='mx-auto center-text'>
			<div className='flex gap-2' style={{flexWrap: "wrap"}}>
				<span><Link className='no-link' to='/'>Privacy Policy</Link></span>
				<span> | </span>
				<span><Link className='no-link' to='/'>Terms of Use</Link></span>
				<span>&copy; {new Date().getFullYear()} {ProdName} All Rights Reserved.</span>
			</div>
		</footer>
	)
}



// export const LandingPage = () => {

//     return (
//         <div className="abs-mid">
//             <p className="fs-1 fw-1000">
//                 Welcome to Message50 Landing Page
//             </p>
//             <small className="fw-100">
//                 Oops! Nothing here yet!
//             </small>
//             <div>
//                 <Link to='/routes'>
//                     {"Routes >"}
//                 </Link>
//             </div>
//         </div>
//     )
// }