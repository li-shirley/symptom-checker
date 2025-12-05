import {Link} from 'react-router-dom'

const NavBar = () => {
    return(
        <header>
            <div className="container">
                <Link to="/symptom-check">
                    <h1>Symptom Checker</h1>
                </Link>
            </div>
        </header>
    )
}

export default NavBar