import './page.css';

import Navbar from './components/Navbar';
import Body from './components/Body';
import { Link } from 'react-router-dom';
import { ProdName } from '../App';


export const SignIn = ({isLogin}) => {

	return (
		<div id="sign-in">
			<Navbar />
			<Body isLogin={isLogin} />
			<Footer />
		</div>
	)
}


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
  


export const Input = ({type, name, label, required, placeholder, children}) => {
    type = type ?? 'text';
    required = required ?? label.slice(-1) === '*';

    return (
        <label className="fw nv-input br-1 flex-col gap-2">
            <div>
                <small className="lb">
                    {label}
                </small>
                <input className="fw" type={type} name={name} placeholder={placeholder} required={required} />
            </div>

            <small> {children} </small>
        </label>
    )
}