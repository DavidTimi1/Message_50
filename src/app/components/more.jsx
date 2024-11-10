

export const More = ({openOverlays}) => {

    return (
        <>
        {/* <Overlay component={ContactCard} name="contact-card" />
        <Overlay component={Feedback} name="feedback" /> */}
        </>
    )


    function Overlay({component, name}){
        const show = openOverlays.get(name);

        return component({show: Boolean( show ), args: show})
    }

}