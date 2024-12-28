import React from 'react';
import './Team.scss';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import imgOne from '../../assets/about/team/1.png';
import imgTwo from '../../assets/about/team/2.png';
import imgThree from '../../assets/about/team/3.png';
import imgFour from '../../assets/about/team/4.png';

const Team = () => {

    const teams = [
        {
            'img': imgOne,
            'name': 'Helin Saygılı'
        },
        {
            'img': imgTwo,
            'name': 'Talha Memişoğlu'
        },
        {
            'img': imgThree,
            'name': 'Hasan Yazgan'
        },
        {
            'img': imgFour,
            'name': 'Berrak Sönmez'
        }
    ]


    return (
        <section className='team-section pt-100' data-aos="fade-up" data-aos-duration="2000">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7">
                        <SectionTitle 
                            subTitle="EKİBİMİZ İLE tanışın"
                            title="Diş hekimlerimizle tanışın"
                        />
                    </div>

                    <div className="col-lg-5">
                        <p className='pt-5'>Hekimlerimizle tanışın: Alanında uzman, güler yüzlü ve deneyimli hekimlerimiz, sizlere en iyi sağlık hizmetini sunmak için burada.</p>
                    </div>
                </div>

                <div className="row">
                    {
                        teams.map (team => 
                            <div className="col-lg-3 col-sm-6">
                                <div className="team-card">
                                    <div className="team-img">
                                        <img src={team.img} alt="" />
                                    </div>
                                    <h3>{team.name}</h3>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
};

export default Team;