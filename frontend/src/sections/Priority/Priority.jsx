import React from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import priorityImg from '../../assets/about/priority.png';
import './Priority.scss';

const Priority = () => {
    return (
        <section className='priority-section emergency-section' data-aos="fade-up" data-aos-duration="2000">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-6">
                        <div className="priority-img">
                            <img src={priorityImg} alt="Emergency" />
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="priority-text">
                            <SectionTitle 
                                subTitle="ÖNCELİĞİMİZ" 
                                title="Müşterilerimiz önceliğimizdir."
                                description="Hasta memnuniyeti, sağlığınız ve konforunuz her zaman önceliğimizdir. Sizlere en iyi hizmeti sunmak için özenle çalışıyoruz."
                            />

                            <div className="theme-btn">
                                <Link to='/'>Randevu al</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Priority;