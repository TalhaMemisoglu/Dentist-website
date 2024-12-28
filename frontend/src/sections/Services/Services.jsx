import React, { useState } from 'react';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import './Services.scss';
import ServicesData from './ServiceData';
import Service from '../../components/Service/Service';
import { BsFillArrowRightCircleFill } from "react-icons/bs";

const Services = () => {
    const [showAll, setShowAll] = useState(false);

    const toggleServices = () => {
        setShowAll(!showAll);
    };

    return (
        <section className='service-section pt-100 pb-70' data-aos="fade-up" data-aos-duration="2000">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-sm-6">
                        <SectionTitle title="Ağız sağlığınız hakkında iyi hissedin" subTitle="HİZMETLERİMİZ"/>
                    </div>
                    <div className="col-lg-6 col-sm-6">
                        <p className='service-title-text'>
                        Sağlığınızı ve gülüşünüzü ön planda tutarak, modern teknikler ve uzman kadromuzla ihtiyaçlarınıza uygun geniş bir yelpazede hizmet sunuyoruz. Her adımda size özel çözümlerle yanınızdayız.
                        </p>
                    </div>
                </div>

                <div className="row">
                    {ServicesData.slice(0, showAll ? ServicesData.length : 4).map(singleService => (
                        <Service key={singleService.title} serviceList={singleService} />
                    ))}
                </div>

                <div className="services-link text-center">
                    <button onClick={toggleServices}>
                        {showAll ? 'Daha az göster' : 'Tüm servisleri görüntüle'}
                        <BsFillArrowRightCircleFill />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Services;
