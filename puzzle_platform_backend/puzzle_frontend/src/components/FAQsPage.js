import React, { useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import "./FAQsPage.css";

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { question: 'Is there a mobile app available for your platform?', answer: 'Technical Issue means: a)a problem with Software; or b) a problem with accessing Software that is hosted on a computer or virtual machine that is owned or controlled by MZD, where the problem affects a Users ability to make use of a major functionality of the Software and includes lack of access, reduced' },
        { question: 'What happens if I encounter a technical issue while using the software?', answer: 'Technical Issue means: a)a problem with Software; or b) a problem with accessing Software that is hosted on a computer or virtual machine that is owned or controlled by MZD, where the problem affects a Users ability to make use of a major functionality of the Software and includes lack of access, reduced' },
        { question: 'Is there a mobile app available for your platform?', answer: 'Technical Issue means: a)a problem with Software; or b) a problem with accessing Software that is hosted on a computer or virtual machine that is owned or controlled by MZD, where the problem affects a Users ability to make use of a major functionality of the Software and includes lack of access, reduced' },
        // Add more FAQs as needed
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-section">
            <div className='Head-tittle'>Find answers to common questions and concerns in our FAQs section.</div>
            <div className='sub-tittle'>We've compiled a list of questions that users often ask, along with detailed answers to assist you further.</div>
            {faqs.map((faq, index) => (
                <div className="faq" key={index}>
                    <div className="faq-question" onClick={() => toggleFAQ(index)}>
                        <div className="question">{faq.question}</div>
                        <div className="toggle-icon">{openIndex === index ? <FaAngleUp /> : <FaAngleDown />}</div>
                    </div>
                    {openIndex === index && <div className="answer">{faq.answer}</div>}
                </div>
            ))}
        </div>
    );
}

export default FAQSection;
