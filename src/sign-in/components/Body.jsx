import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Input } from '../page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Button } from '../../components/Button';
import { AuthContext } from '../../auth/AuthContexts';
import { apiHost } from '../../App';


const Body = ({isLogin}) => {
    const [status, setStatus] = useState(false);
	const ref = useRef(null);

	const navigate = useNavigate();
	const pathname = useLocation().pathname;

	const logUIIn = useContext(AuthContext).login;

	useEffect(() => {
		const body = ref.current;
		setTimeout(() => body.classList.remove('not-animated'));

		return () => {
			body.classList.add('not-animated')
		}

	}, [pathname])

	
    useEffect(() => {
        if (status === true){
            setTimeout(() => {
                navigate("/app");
            }, 500)
        }
    }, [status])


	return (
		<div key={{}} className='box fw pad can-animate not-animated' ref={ref}>
			<div className="header">
				<h1> <p> { isLogin? "Welcome Back" : "Sign Up" } </p> </h1>
			</div>
				
				<form className="mx-auto" onSubmit={handleSubmit}>
					<Aesthetics />

					<div className='max form-body br-1'>

						<div className="fw flex-col gap-3">
							
							{
								status.error &&
								<div className="err-msg center-text">
									{status.error}
								</div>
							}

							<Button className="br-5" onClick={handleGuestSignIn}>
								{
									status === "pending" ? 
									<FontAwesomeIcon icon={faSpinner} spin />
									:
									status === true ?
									<FontAwesomeIcon icon={faCheckCircle} />
									:
									"Continue as Guest User"
								}
							</Button>

							<div className='fw or'>
								<div className='mx-auto'> OR </div>
							</div>

							<Input type="text" name="username" label="Username*" placeholder='Enter your username' autoComplete={isLogin? 'username' : undefined} />

							{ !isLogin && <Input type="email" name="email" label="Email*" placeholder='Enter your email address' autoComplete={isLogin? 'email' : undefined} /> }
							
							<Input type="password" name="password" label="Password*" placeholder='Enter your password' minLength={8} autoComplete={isLogin? 'msg50-password' : undefined} />

							{/* <div className='flex fw' style={{justifyContent: "flex-end"}}>
								<Link className='no-link' to='/reset'>
									Forgot Password?
								</Link>
							</div> */}

							<Button className="br-5" type="submit" disabled={["pending", true].includes(status)}>
								{
									status === "pending" ? 
									<FontAwesomeIcon icon={faSpinner} spin />
									:
									status === true ?
									<FontAwesomeIcon icon={faCheckCircle} />
									:
									isLogin? "Login" : "Sign Up"
								}
							</Button>

							<div className='flex mx-auto gap-2' style={{justifyContent: "center"}}>
								{
									isLogin?
									<>
										<span>Don't have an account? </span>
										<Link className='no-link' to='/register'>
											Register here
										</Link>
									</>
									:
									<>
										<span>Already registered? </span>
										<Link className='no-link' to='/login'>
											Login here
										</Link>
									</>
								}
							</div>
						</div>
						
					</div>
				</form>
		</div>
	)

	function handleGuestSignIn(){
		const guestUrl = apiHost + "/guest-login";
		console.log("Logging in as guest...")
		setStatus("pending");

		axios.post(guestUrl)
		.then((response) => {
			console.log(response.data.message);
			logUIIn(response.data.access_token);
			setStatus(true);
		})
		.catch((error) => {
			console.error('Error signing in:', error);

			setStatus({
                error: error.response?.data?.detail || error.message || "An error occurred. Please try again."
			});
		});
	}

	function handleSubmit(e){
		e.preventDefault();

		setStatus("pending");

        const formData = new FormData(e.target);

		if (isLogin){
			logInWithDetails(formData);

		} else {
			registerWithDetails(e.target);
		}

	}

	function logInWithDetails(data){
		const loginUrl = apiHost + "/login";
		console.log("Logging in...")

		axios.post(loginUrl, data)
		.then((response) => {
			console.log('Logged In successfully:', response.data);
			logUIIn(response.data.access);
			setStatus(true);
		})
		.catch((error) => {
			console.error('Error signing in:', error);

			setStatus({
                error: error.response?.data?.detail || error.message || "An error occurred. Please try again."
			});
		});
	}

	function registerWithDetails(form){
        const data = new FormData(form);
		const regUrl = apiHost + "/register";

        return axios.post(regUrl, data)
        .then((response) => {
            console.log('Registered successfully:', response.data);			
			logInWithDetails(data);
			return data;
			
        })
        .catch((error) => {
            console.error('Error signing in:', error);

            setStatus({
                error: error.response?.data?.detail || error.message || "An error occurred. Please try again."
            });
        });
	}
}


const Aesthetics = () => {

	return (
		<div className='abs-top max form-bg'>
			<div className='abs circle' style={{
				backgroundColor: "var(--body2-col)", width: "100px", top: "-30px", left: "-50px"
			}}></div>
			
			<div className='abs circle' style={{
				backgroundColor: "var(--btn-col)", width: "50px", top: "-20px", right: "-20px"
			}}></div>
			
			<div className='abs circle' style={{
				backgroundColor: "var(--text-col)", width: "50px", bottom: "-20px", left: "-20px"
			}}></div>
			
			<div className='abs circle' style={{
				backgroundColor: "var(--sec-col)", width: "100px", bottom: "-30px", right: "-50px"
			}}></div>
		</div>
	)
}

export default Body

