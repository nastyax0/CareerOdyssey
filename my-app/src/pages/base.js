import NavBar from './navigationBar';

const Base = ({title = "Welcome to our website", children}) => {
    return(
        <div className="container-fluid p-0 m-0"> 
        <NavBar/>
        {children}
        <h1>This is footer</h1>
        </div>
       

    );
};

export default Base;
