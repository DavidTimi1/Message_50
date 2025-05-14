
import './page.css';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { apiHost, githubLink, portfolioLink, ProdName } from '../App';
import Navbar from './Navbar';
import { useTransitionOnLoad } from '../app/components/Hooks';
import { Button } from '../components/Button';
import { Input } from '../sign-in/page';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faDownload } from '@fortawesome/free-solid-svg-icons';
import { installPWA, usePWAContext } from '../lib/pwa';


const LandingPage = () => {
    const [scroll, setScroll] = useState(false);

    const { isInstalled, installPrompt } = usePWAContext();
    const isInstallable = Boolean(installPrompt) || isInstalled;

    const ref = useRef();

    useTransitionOnLoad(ref);


    return (
        <main className='landing-page max' onScroll={handleScroll}>
            <Navbar scroll={scroll} />

            <div className="content max mid-align flex-col can-animate not-animated" style={{padding: 0, margin: 0}} ref={ref}>
            {/* Hero Section */}
            <header className="hero pad d-flex gap-3 flex-md-row flex-col align-items-center justify-content-center">
                <div className="hero-img col-md-5 container-sm">
                    <img src="/msg-bubble.png" alt="Hero" className="fw br-1" style={{ objectFit: "contain" }} />
                </div>
                <div className="d-flex flex-col gap-3 col-md-6">
                    <p className="hero-tagline d-flex flex-col gap-3">
                        <h1 className='fs-1 fw-bold'>
                            Connect Privately <br />
                            with Friends and Family <br />
                        </h1>

                        <p className='fs-6 fw-light text2-col'>
                            Experience quick seamless and secure communication. <br /> The best messaging app for you
                        </p>

                        <em className="sr-only">
                            Message50 is the best, fastest and most secure messaging application
                        </em>
                    </p>
                    
                    {
                        isInstalled || isInstallable ?

                        <div className='d-flex gap-2 align-items-center'>
                            <Button onClick={() => installPWA(installPrompt)}>
                                <FontAwesomeIcon icon={faDownload} />
                                <span> {isInstalled? "Use" : "Install"} App </span>
                            </Button>
                            <Link to="/app" className="my-btn no-link deval br-5X">
                                <div className="btn-bg">
                                    <div className="btn d-flex mid-align gap-2">
                                        <span> Continue on the web </span>
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </div>
                                </div>
                            </Link>
                        </div>
                        :
                        <>
                        <Link to="/app" className="my-btn no-link br-5">
                            <div className="btn-bg">
                                <div className="btn max">
                                    <span> Get Started </span> <span className="sr-only">with enhanced communication</span>
                                    <FontAwesomeIcon icon={faAngleRight} />
                                </div>
                            </div>
                        </Link>
                            
                        {
                            !isInstallable &&
                            <small className='mx-auto fs-light' style={{color: "var(--text2-col)"}}>
                                Your device currently doesn't support installation of this WebApp. <br /> To do this visit options menu and click "Add to Home Screen"
                            </small>
                        }
                        </>
                    }
                    
                </div>
            </header>

            <Features />

            <Gallery />

            <FAQ />

            <div className='fw pad'> <hr /> </div>

            <div id="contact-us" className="fw pad box">
                <div className="d-flex fw flex-column-reverse flex-md-row gap-4 align-items-center" style={{justifyContent: "space-evenly"}}>
                    <div className="flex-col mid-align">
                        <div className="flex mid-align">
                            <div style={{width: "50px", aspectRatio: 1/1}}>
                                <img src="/logo.png" alt="Logo" className="logo fw" style={{objectFit: "contain"}}  />
                            </div>
                            <div className="hero-title fh"> {ProdName} </div>
                        </div>
                        <Footer />
                    </div>

                    <Feedback />
                </div>
            </div>

            </div>
            
        </main>
    );

    function handleScroll(e){
        const isScrolling = e.target.scrollTop > 10;

        if (isScrolling != scroll){
            setScroll(isScrolling);
        }
    }
};

export default LandingPage;


const features = [
    {
        title: "End-to-End Encryption",
        description: "Your messages stay private - always.",
        icon: "🔒"
    },
    {
        title: "Cross-Platform",
        description: "Access your chats anytime, anywhere.",
        icon: "🌍"
    },
    {
        title: "Lightning Fast",
        description: "Instant delivery with cutting-edge technology.",
        icon: "⚡"
    },
    {
        title: "User-Friendly Interface",
        description: "Navigate effortlessly with our intuitive design.",
        icon: "🖥️"
    },
    {
        title: "Media Sharing",
        description: "Share images, videos, and documents seamlessly.",
        icon: "📤"
    },
]

const Features = () => (
    <section id="features" className="features pad box fw">
        <h1 className="section-title center-text mb-5"> Why Choose { ProdName }? </h1>

        <ol className="features-cards d-flex gap-5 flex-wrap" style={{justifyContent: "space-evenly"}}>

            {features.map((feature, index) => (
                <li className="feature-card d-flex br-5 gap-2" key={index}>
                    <div className="feature-icon">
                        {feature.icon}
                    </div>
                    <div className="">
                        <h2 className="fs-3 feature-title">{feature.title}</h2>
                        <p className="fw-light fs-6">{feature.description}</p>
                    </div>
                </li>
            ))}

        </ol>
    </section>

)


const FAQ = () => {
    const faqs = [
        {
            question: "Is my data secure on this platform?",
            answer: "Yes, we use end-to-end encryption (e2ee) to ensure your data remains private and secure."
        },
        {
            question: "Can I use this platform on multiple devices?",
            answer: "Absolutely! Our platform is cross-platform and works seamlessly on all your devices."
        },
        {
            question: "How fast is the message delivery?",
            answer: "Messages are delivered instantly using our cutting-edge technology."
        },
        {
            question: "What is end-to-end encryption (E2EE)?",
            answer: "End-to-end encryption ensures that only you and the person you're communicating with can read the messages. No one else, not even the platform, can access your messages."
        },
        {
            question: "Can anyone intercept my messages?",
            answer: "No, with E2EE, messages are encrypted on your device and decrypted only on the recipient's device, making interception impossible."
        },
        {
            question: "Are media files also encrypted?",
            answer: "Yes, all media files, including images, videos, and documents, are encrypted to ensure complete privacy and security." 
        },
        {
            question: "What happens if I lose my device?",
            answer: "If you lose your device, your messages cannot be accessed without your private key. Always ensure you have a backup of your encryption keys."
        }
    ];

    return (
        <section id="faqs" className="faq-section pad box fw">
            <h1 className="section-title center-text mb-5"> Frequently Asked Questions </h1>
            <ul className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                    <li className="accordion-item" style={{backgroundColor: "var(--body2-col)" }}  key={index}>
                        <h2 className="accordion-header" id={`heading${index}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                style={{backgroundColor: "var(--body-col)", color: "var(--text-col)" }} 
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse${index}`}
                                aria-expanded="false"
                                aria-controls={`collapse${index}`}
                            >
                                {faq.question}
                            </button>
                        </h2>
                        <div
                            id={`collapse${index}`}
                            className="accordion-collapse collapse"
                            style={{backgroundColor: "var(--body3-col)" }}
                            aria-labelledby={`heading${index}`}
                            data-bs-parent="#faqAccordion"
                        >
                            <p className="accordion-body">{faq.answer}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};


const featuresIllustrations = [

    {
        title: "End-to-End Encryption",
        description: "Your messages stay private - always. We use state-of-the-art encryption technology to ensure that only you and the intended recipient can access your messages, providing unparalleled privacy and security.",
        icon: "🔒",
        image: "/e2ee-placeholder.jpg",
        ratio: 2048/1200,
    },
    {
        title: "Cross-Platform",
        description: "Access your chats anytime, anywhere. Whether you're on your phone, tablet, or desktop, our platform ensures a seamless experience across all your devices, keeping you connected wherever you go.",
        icon: "🌍",
        image: "/multidevice-gif.gif",
        ratio: 400/300,
    },
    {
        title: "Lightning Fast",
        description: "Instant delivery with cutting-edge technology. Experience real-time communication with no delays, ensuring your messages are delivered as quickly as you can type them.",
        icon: "⚡",
        image: "/instant-messaging.gif",
        ratio: 800/600,
    },
    // {
    //     title: "User-Friendly Interface",
    //     description: "Navigate effortlessly with our intuitive design. Our platform is built with simplicity in mind, making it easy for users of all ages and technical abilities to communicate effectively.",
    //     icon: "🖥️",
    //     image: "/placeholder-img.jpg",
    //     ratio: 1,
    // },
    {
        title: "Media Sharing",
        description: "Share images, videos, and documents seamlessly. All media files are also end-to-end encrypted, ensuring complete privacy and security.",
        icon: "📤",
        image: "/attachment-menu.png",
        ratio: 1580/904,
    },
];

const Gallery = () => {

    return (
        <section className="gallery-section pad box fw">
            <ul className="gallery d-flex fw flex-col" style={{gap: "5rem"}}>

                {featuresIllustrations.map((feature, index) => (
                    <li className="d-flex flex-col fw mid-align gap-3" key={index}>
                        <div className="col-md-5">
                            <img src={feature.image} alt={`Gallery image depicting ${feature.title} feature`} className="br-1 fw" style={{ objectFit: "contain", aspectRatio: feature.ratio }} />
                        </div>
                        <div className="col-md-7">
                            <div className="mx-auto" style={{maxWidth: "400px"}}>
                                <h2 className='fw-bold fs-2'>
                                    {feature.title}
                                </h2>
                                <p className="text2-col fw-light">
                                    <small>{feature.description}</small>
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};


function Feedback() {
    const [state, setState] = useState();
    const formRef = useRef(null);
    const sent = state?.status;

    return (
        <section className="feedback br-1 flex-col gap-3">
            <h2 className="section-title mb-2">We Value Your Feedback</h2>

            <form method="post" action={`${apiHost}/feedback/message50`} className="fw br-1 up" ref={formRef} onSubmit={handleSubmit}>
                <div className='fw flex-col gap-3'>

                    {
                        state?.data &&
                        <div className={`alert ${ sent ? "alert-success" : "alert-danger"}`} role="alert">
                            {state.data}
                        </div>
                    }

                    <div className="flex md-flex-col fw gap-3">
                        <Input label="Name*" id="inputName" name="user_name" />
                        <Input label="Email*" type="email" id="inputEmail" name="email" />
                    </div>

                    <Input label="Subject*" id="inputSubject" name="subject" />

                    <label className="fw nv-input br-1 flex-col gap-2">
                        <small className="lb">
                            Message*
                        </small>
                        <textarea className="fw" name="message" placeholder="Type in your message..." required />
                    </label>
    

                    <label className="fw flex mid-align gap-2">
                        <input type="checkbox" name="subscribe" style={{ padding: "10px" }} />
                        <div>
                            Subscribe to receiving updates on our progress
                        </div>
                    </label>
                    <div className="mx-auto flex" style={{ justifyContent: 'right' }}>
                        <Button type="submit">
                            Send Feedback
                        </Button>
                    </div>

                </div>
            </form>
        </section>
    )

    function handleSubmit(e) {
        const { target } = e;
        e.preventDefault();

        const fd = new FormData(target);

        axios.post(`${apiHost}/feedback/message50`, fd)
        .then(res => {
            clearInputs();
            setState({ status: true, data: res.data.success });
        })
        .catch(err => {
            setState({ status: false, data: err.message });
        })
    }


    function clearInputs() {
        const all = ["message", "subject"];

        all.forEach(elem => {
            formRef.current[elem].value = '';
        })
    }
}



const Footer = () => {
	return (
		<footer className='mx-auto center-text'>
			<div className='flex-col gap-2' style={{flexWrap: "wrap"}}>
                <div>
                    <span><Link className='no-link' to='/privacy.pdf' target='_blank' rel="noreferrer noopener">
                        Privacy Policy 
                        <span className="sr-only"> for Message50 </span> 
                    </Link></span>
                    <span> | </span>
                    <span><Link className='no-link' to='/terms.pdf' target='_blank' rel="noreferrer noopener"> 
                        Terms of Use 
                        <span className="sr-only"> for Message50 </span> 
                    </Link></span>
                </div>
				<span>
                    &copy; {new Date().getFullYear()} {ProdName} All Rights Reserved.
                </span>
                <em className='sr-only'>
                    Message50 is developed by Dev_id (David Uwagbale) 
                    
                    <a href={githubLink}>
                        Link to David's github profile
                    </a>
                    <a href={portfolioLink}>
                        Link to David's portfolio website
                    </a>
                </em>
			</div>
		</footer>
	)
}