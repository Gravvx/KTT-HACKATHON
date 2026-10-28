const governmentServices = {
  social_security: {
    en: {
      name: "Social Security",
      description: "Pension schemes, disability allowance, and social security benefits",
      steps: [
        "Aadhaar Card",
        "Income Certificate", 
        "Bank Account Details",
        "Age Proof Document"
      ],
      departments: "Ministry of Social Justice & Empowerment",
      helpline: "1950"
    },
    hi: {
      name: "सामाजिक सुरक्षा",
      description: "पेंशन योजना, विकलांगता भत्ता और सामाजिक सुरक्षा लाभ",
      steps: [
        "आधार कार्ड",
        "आय प्रमाण पत्र",
        "बैंक खाता विवरण", 
        "आयु प्रमाण दस्तावेज"
      ],
      departments: "सामाजिक न्याय और अधिकारिता मंत्रालय",
      helpline: "1950"
    },
    mr: {
      name: "सामाजिक सुरक्षा",
      description: "पेन्शन योजना, अपंगत्व भत्ता आणि सामाजिक सुरक्षा लाभ",
      steps: [
        "आधार कार्ड",
        "उत्पन्न प्रमाणपत्र",
        "बँक खाते तपशील",
        "वय पुरावा कागदपत्र"
      ],
      departments: "सामाजिक न्याय आणि अधिकारिता मंत्रालय",
      helpline: "1950"
    }
  },
  healthcare: {
    en: {
      name: "Healthcare Services",
      description: "Ayushman Bharat, health insurance, and medical facilities",
      steps: [
        "Aadhaar Card",
        "Ration Card",
        "Family ID",
        "Income Certificate"
      ],
      departments: "Ministry of Health & Family Welfare",
      helpline: "104"
    },
    hi: {
      name: "स्वास्थ्य सेवाएं",
      description: "आयुष्मान भारत, स्वास्थ्य बीमा और चिकित्सा सुविधाएं",
      steps: [
        "आधार कार्ड",
        "राशन कार्ड", 
        "पारिवारिक पहचान पत्र",
        "आय प्रमाण पत्र"
      ],
      departments: "स्वास्थ्य और परिवार कल्याण मंत्रालय",
      helpline: "104"
    },
    mr: {
      name: "आरोग्य सेवा",
      description: "आयुष्मान भारत, आरोग्य विमा आणि वैद्यकीय सुविधा",
      steps: [
        "आधार कार्ड",
        "रेशन कार्ड",
        "कुटुंब ओळखपत्र", 
        "उत्पन्न प्रमाणपत्र"
      ],
      departments: "आरोग्य आणि कुटुंब कल्याण मंत्रालय",
      helpline: "104"
    }
  },
  education: {
    en: {
      name: "Education Services",
      description: "School admissions, scholarships, and educational benefits",
      steps: [
        "Birth Certificate",
        "Previous School Certificate",
        "Caste Certificate (if applicable)",
        "Income Certificate"
      ],
      departments: "Ministry of Education",
      helpline: "1800-11-2020"
    },
    hi: {
      name: "शिक्षा सेवाएं", 
      description: "स्कूल प्रवेश, छात्रवृत्ति और शैक्षिक लाभ",
      steps: [
        "जन्म प्रमाण पत्र",
        "पिछली स्कूल प्रमाणपत्र",
        "जाति प्रमाण पत्र (यदि लागू हो)",
        "आय प्रमाण पत्र"
      ],
      departments: "शिक्षा मंत्रालय",
      helpline: "1800-11-2020"
    }
  }
};

module.exports = governmentServices;
