import { useState } from "react";
import api from "../../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import './Login.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../sections/Footer/Footer';
import RequestPasswordReset from "../PasswordReset/RequestPasswordReset";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation(); // Retrieve state passed during navigation

    // Extract the redirect path passed via state (or use default "/")
    const redirectTo = location.state?.redirectTo || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/login/", { email, password });

            if (res.status === 200 && res.data) {
                const { access, refresh } = res.data;

                // Save JWT tokens in localStorage
                localStorage.setItem(ACCESS_TOKEN, access);
                localStorage.setItem(REFRESH_TOKEN, refresh);

                // Redirect dynamically based on the state or default to "/"
                navigate(redirectTo);
            } else {
                throw new Error("Invalid login response");
            }
        } catch (error) {
            // Detaylı hata loglaması
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
 
                const errorMessage = error.response.data.detail ||
                    error.response.data.message ||
                    error.response.data.error ||
                    "Giriş başarısız oldu.";
                
                if (error.response.status === 500) {
                    setError("Sunucu hatası oluştu. Lütfen sistem yöneticisi ile iletişime geçin.");
                } else if (error.response.status === 401) {
                    setError("Email veya şifre hatalı.");
                } else {
                    setError(errorMessage);
                }
            } else if (error.request) {
                setError("Serverdan yanıt yok. Lütfen tekrar deneyin.");
                alert("Giriş başarısız oldu: Serverdan yanıt yok.");
            } else {
                setError("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
                alert("Giriş başarısız oldu: Bir şeyler ters gitti.");
            }
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row border rounded-5 p-3 bg-white shadow box-area">
                    <div className="col-12 min-width">
                        <div className="row align-items-center">
                            <div className="header-text mb-4">
                                <h2>Giriş Yap</h2>
                                <p>Hadi yüzünüze gülümseme koyalım :)</p>
                            </div>

                            <form onSubmit={handleSubmit} className="form-container">
                                <div className="form-group">
                                    <div className="input-group mb-3 col">
                                        <input
                                            type="email"
                                            className="form-control form-control-lg fs-6"
                                            placeholder="Email adresi"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="input-group mb-1 col">
                                        <input
                                            type="password"
                                            className="form-control form-control-lg fs-6"
                                            placeholder="Şifre"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group mb-5 d-flex justify-content-between">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="formCheck" />
                                        <label htmlFor="formCheck" className="form-check-label text-secondary">
                                            <small>Beni Hatırla</small>
                                        </label>
                                    </div>
                                    <div className="forgot">
                                        <small><Link to="/request-password-reset">Şifreni mi Unuttun?</Link></small>
                                    </div>
                                </div>
                                <div className="input-group mb-3">
                                    <button
                                        type="submit"
                                        className="btn btn-lg btn-primary w-100 fs-6 button-group"
                                        disabled={loading}
                                    >
                                        {loading ? "Yükleniyor..." : "Giriş Yap"}
                                    </button>
                                </div>

                                {error && <div className="error-message text-danger">{error}</div>} {/* Display error message */}

                                <div className="row">
                                    <small>
                                        Hesabın yok mu? <Link to="/register">Kaydol</Link>
                                    </small>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;
