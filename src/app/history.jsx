import { on } from "../utils";

import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StateNavigatorContext } from "./contexts";


export const StateNavigatorProvider = ({children}) => {

    return (
        <StateNavigatorContext.Provider value={useStateNavigation()}>
            {children}
        </StateNavigatorContext.Provider>
    )
}


export const useStateNavigation = () => {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const stateStack = useRef([]);
    
    const getStateObj = (stack) => stack.map(state => state.state);
    

    // useEffect(() => {
    //     window.addEventListener('popstate', handlePopState);
    //     return () => {
    //       window.removeEventListener('popstate', handlePopState);
    //     };
    // }, []);

    useEffect(() => {
        stateStack.current = []; // restart if the path changes
        on('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pathname]);


    // Push state to the history stack
    const pushState = useCallback((newState, onPop, path) => {
        const toPush = { state: newState, onPop };
        path = path ?? pathname;
        
        let replace, currentState = getCurrentState();

        if (currentState === newState) return
        
        if (currentState !== 'base') 
            replace = true;

        stateStack.current.push(toPush);

        navigate(path, { state: getStateObj( stateStack.current ), replace }); // '' ensures no URL change

    }, [pathname])


    return { getCurrentState, pushState, removeState};


    function getCurrentState(){
        return stateStack.current.slice(-1)?.[0]?.state ?? 'base';
    }


    // Handle the back button by popping the state
    function handlePopState(){
        const prev = stateStack.current;
        const newStack = [...prev];

        let len = newStack.length;
    
        if (!len || len < 1){
            return []
        }
    
        const popped = newStack.pop();

        if (len > 1){
            const stateObj = getStateObj(newStack);
    
            navigate(pathname, { state:stateObj }); // '' ensures no URL change
        
        }

        stateStack.current = newStack // update history stack

        return popped.onPop?.(); // call defined function

    }
    

    function removeState(state) {
        const index = stateStack.current.map(s => s.state).lastIndexOf(state);
      
        if (index === -1) return;
      
        const toRemove = stateStack.current.splice(index);
      
        // Call all `onPop`s from top to target state
        for (const entry of toRemove.reverse()) {
          entry.onPop?.();
        }
      
        // Actually go back in browser history
        navigate(-1 - index);
      
        return true;
      }
      
};


// export const appHistory = {
//     current: "base",
//     stack: new Array(),

//     _init: init(),


//     push(state, onPop, urlChange) {
//         const toPush = { state, onPop, urlChange }
//         this.stack.push(toPush);

//         const stateObj = this.stack.map(state => state.state);

//         if (this.current === "base")
//             window.history.pushState(stateObj, "", urlChange)

//         else
//             window.history.replaceState(stateObj, "", urlChange)

//         this.current = state;
//     },

//     _popstate_(e) {
//         let len = this.stack.length;

//         if (!len || len < 1){
//             return
//         }

//         const popped = this.stack.pop();
//         popped.onPop?.(); // call defined function

//         if (len === 1)
//             this.current = "base";

//         else {
//             const stateObj = this.stack.map(state => state.state), current = this.stack.slice(-1)[0];

//             window.history.pushState(stateObj, '', current.urlChange)

//             this.current = current.state;
//         }

//     },

//     remove(state){
//         if (this.current === state){
//             window.history.back();
//             return
//         }

//         const stackClone = [...this.stack].reverse();

//         const index = stackClone.findIndex(item => item.state === state );
//         if (index > -1){
//             window.history.go(-1-index);
//             console.log(index);
//         }
//     }
// }


// //  function useHistoryReset(){
// //     const {pathname} = useLocation();

// //     useEffect(() => {
// //         appHistory.stack = [];
// //         appHistory.current = "base";

// //     }, [pathname]);

// //     return pathname;
// // }

// function init() {
//     window.history.replaceState([], "");

//     on('popstate', () => appHistory._popstate_());
//     console.log("history initialised");
    
//     console.log(window.history.state)
// }