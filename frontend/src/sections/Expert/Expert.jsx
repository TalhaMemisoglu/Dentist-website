import React from 'react';
import './Expert.scss';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { BsFillCheckCircleFill } from "react-icons/bs";
import expertImg from '../../assets/expert.png';

const Expert = () => {
    return (
        <section className='expert-section' data-aos="fade-up" data-aos-duration="2000">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-6">
                        <div className="expert-text">
                            <SectionTitle 
                                subTitle="DİŞTE UZMANLIK"
                                title="En iyi diş hekimlerinden birinci sınıf diş hekimliği."
                                description=""
                            />

                            <ul>
                                <li>
                                    <BsFillCheckCircleFill />
                                    En kaliteli diş ekibi
                                </li>
                                <li>
                                    <BsFillCheckCircleFill />
                                    Son teknoloji diş hizmetleri
                                </li>
                                <li>
                                    <BsFillCheckCircleFill />
                                    Tüm diş tedavilerinde indirim
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="expert-img">
                            <img src={expertImg} alt="expert" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Expert;