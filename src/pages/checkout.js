import axios from 'axios';

export default function Checkout() {

    return (
        <></>
    );
}

export async function getServerSideProps(context) {
    const props = {};

    if (context.query?.itemId) {
        props.itemId = context.query.itemId;


    } else {
        return {redirect: {destination: '/', permanent: false}};
    }

    return {props};
}
