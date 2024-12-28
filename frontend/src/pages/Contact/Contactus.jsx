import React from 'react';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../sections/Footer/Footer';
import './Contactus.scss';

const Contactus = () => {
    return (
        <>
            <section className='section-bg section-common contact-section'>
                <Navbar />
                <SectionTitle 
                    title="Bizimle iletişime geçin"
                    description="Bizimle iletişime geçin: Sorularınız, randevu talepleriniz veya önerileriniz için size yardımcı olmaktan mutluluk duyarız. Bize ulaşmak için aşağıdaki iletişim kanallarını kullanabilirsiniz."
                />
                <div className="contact-info-container">
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d314.27508655493345!2d36.096431130836354!3d37.37514645827662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152cd2e7b9c1c25f%3A0xa95a9c8f97a14550!2sDere%2C%20367.%20Sk.%20No%3A35%2C%2080700%20Kadirli%2FOsmaniye!5e0!3m2!1str!2str!4v1699790544513!5m2!1str!2str"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Dere Mahallesi, Kadirli, Osmaniye"
                        ></iframe>
                    </div>

                    <div className="contact-details">
                        <h3>İletişim Bilgileri</h3>
                        <p><strong>WhatsApp:</strong> <a href="https://wa.me/+905363630690
" target="_blank" rel="noopener noreferrer">	0536 363 06 90
</a></p>
                        <p><strong>Email:</strong> <a href="mailto:info@ornekmail.com">readmedentist@gmail.com</a></p>
                        <p><strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00</p>
                        <div className="social-media">
                            
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Contactus;
