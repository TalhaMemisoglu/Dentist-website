import { useState, useEffect } from 'react';
import './Emergency.scss';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import EmergencyImg from '../../assets/emergency.png';
import { Link } from 'react-router-dom';

const Emergency = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on component mount
    useEffect(() => {
        // Eğer kullanıcı localStorage'da token varsa oturum açmış kabul et
        const token = localStorage.getItem("access");
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    return (
        <section className='emergency-section' data-aos="fade-up" data-aos-duration="2000">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-6">
                        <div className="emergency-img">
                            <img src={EmergencyImg} alt="Acil durum" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="emergency-text">
                            <SectionTitle
                                subTitle="24 SAAT ACİL DESTEK"
                                title="Yerel kliniğimizde nazik, dostça bir tedavi."
                                description="Acil dental ihtiyaçlarınızda hızlı ve etkili çözümler sunuyoruz. Sağlığınız için bir telefon uzağınızdayız, bize hemen ulaşabilirsiniz!"
                            />

                            <div className="theme-btn">
                                <Link to={isAuthenticated ? '/choose' : '/patients'} className="nav-link theme-btn-link">
                                    Randevu al
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Emergency;
