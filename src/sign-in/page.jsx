import './page.css';

import Navbar from './components/Navbar';
import Body from './components/Body';
import { Link } from 'react-router-dom';
import { ProdName } from '../App';
import { useState } from 'react';


export const SignIn = ({isLogin}) => {
	const [scroll, setScroll] = useState(false);

	return (
		<div id="sign-in" className='max' onScroll={handleScroll}>
			<Navbar scroll={scroll} />
			<Body isLogin={isLogin} />
			<Footer />
		</div>
	)


    function handleScroll(e){
        const isScrolling = e.target.scrollTop > 10;

        if (isScrolling != scroll){
            setScroll(isScrolling);
        }
    }
}


const Footer = () => {
	return (
		<footer className='mx-auto center-text'>
			<div className='flex gap-2' style={{flexWrap: "wrap"}}>
                <span><Link className='no-link' to='/privacy.pdf' target='_blank' rel="noreferrer noopener">
                    Privacy Policy 
                    <span className="sr-only"> for Message50 </span> 
                </Link></span>
                <span> | </span>
                <span><Link className='no-link' to='/terms.pdf' target='_blank' rel="noreferrer noopener"> 
                    Terms of Use 
                    <span className="sr-only"> for Message50 </span> 
                </Link></span>
				<span>&copy; {new Date().getFullYear()} {ProdName} All Rights Reserved.</span>
			</div>
		</footer>
	)
}
  


export const Input = ({type='text', name, label, required, placeholder, children, autoComplete}) => {
    required = required ?? label.slice(-1) === '*';

    return (
        <label className="fw nv-input br-1 flex-col gap-2">
            <div>
                <small className="lb">
                    {label}
                </small>
                <input className="fw" type={type} name={name} placeholder={placeholder} required={required} autoComplete={autoComplete} />
            </div>

            <small> {children} </small>
        </label>
    )
}