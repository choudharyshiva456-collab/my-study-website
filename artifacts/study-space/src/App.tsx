import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  Flame,
  History as HistoryIcon,
  Menu,
  Moon,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

type Subject = { id: string; label: string; hindi: string; note: string };
type Topic = { id: string; english: string; hindi: string; detail: string };
type Note = { id: number; title: string; body: string; subject: string; createdAt: string };
type Question = { id: number; question: string; options: string[]; answer: number; hint: string };
type QuizMode = 'standard' | 'random' | 'timed';
type HistoryEntry = { id: number; subject: string; score: number; total: number; percentage: number; date: string; mode: QuizMode };
type Stats = { sessions: number; minutes: number; mcqs: number; best: number; last: number | null; tests: number; bestPercentage: number };

const subjects: Subject[] = [
  { id: 'Polity', label: 'Polity', hindi: 'राजव्यवस्था', note: 'Constitution, institutions, rights' },
  { id: 'History', label: 'History', hindi: 'इतिहास', note: 'Stories that shaped the republic' },
  { id: 'Geography', label: 'Geography', hindi: 'भूगोल', note: 'Land, climate, people' },
  { id: 'Economy', label: 'Economy', hindi: 'अर्थव्यवस्था', note: 'Markets, policy, livelihoods' },
  { id: 'Environment', label: 'Environment', hindi: 'पर्यावरण', note: 'The living systems around us' },
  { id: 'Science & Tech', label: 'Science & Tech', hindi: 'विज्ञान और तकनीक', note: 'Ideas changing the everyday' },
];

const topics: Topic[] = [
  { id: 'article-14', english: 'Article 14', hindi: 'समानता का अधिकार', detail: 'Equality before law and equal protection of laws.' },
  { id: 'article-21', english: 'Article 21', hindi: 'जीवन और व्यक्तिगत स्वतंत्रता', detail: 'The living core of dignity and personal liberty.' },
  { id: 'article-32', english: 'Article 32', hindi: 'संवैधानिक उपचार', detail: 'The right to move the Supreme Court for remedies.' },
  { id: 'fundamental-rights', english: 'Fundamental Rights', hindi: 'मौलिक अधिकार', detail: 'Part III of the Constitution, Articles 12–35.' },
  { id: 'polity-revision', english: 'Polity Revision', hindi: 'राजव्यवस्था पुनरावृत्ति', detail: 'A quick second pass through your polity notes.' },
];

const questionBanks: Record<string, Question[]> = {
  Polity: [
    { id: 1, question: 'भारतीय संविधान का अनुच्छेद 14 किससे संबंधित है?', options: ['स्वतंत्रता का अधिकार', 'समानता का अधिकार', 'धार्मिक स्वतंत्रता', 'संवैधानिक उपचार'], answer: 1, hint: 'Think: equality before law.' },
    { id: 2, question: 'भारतीय संविधान का अनुच्छेद 21 किससे संबंधित है?', options: ['समानता का अधिकार', 'जीवन और व्यक्तिगत स्वतंत्रता', 'धार्मिक स्वतंत्रता', 'संपत्ति का अधिकार'], answer: 1, hint: 'It protects the life and liberty of every person.' },
    { id: 3, question: 'अनुच्छेद 32 किससे संबंधित है?', options: ['संवैधानिक उपचार का अधिकार', 'समानता का अधिकार', 'शिक्षा का अधिकार', 'धार्मिक स्वतंत्रता'], answer: 0, hint: 'Dr. Ambedkar called it the heart and soul.' },
    { id: 4, question: 'डॉ. बी. आर. अम्बेडकर ने किस अनुच्छेद को “heart and soul” कहा था?', options: ['अनुच्छेद 14', 'अनुच्छेद 19', 'अनुच्छेद 32', 'अनुच्छेद 21'], answer: 2, hint: 'It lets citizens approach the Supreme Court.' },
    { id: 5, question: 'मौलिक अधिकार संविधान के किस भाग में हैं?', options: ['भाग I', 'भाग II', 'भाग III', 'भाग IV'], answer: 2, hint: 'Directive Principles follow in the next part.' },
    { id: 6, question: 'अनुच्छेद 14 किस सिद्धांत से संबंधित है?', options: ['विधि के समक्ष समानता', 'धार्मिक स्वतंत्रता', 'संवैधानिक उपचार', 'शिक्षा का अधिकार'], answer: 0, hint: 'The law must see equals as equals.' },
    { id: 7, question: 'भारतीय संविधान में मौलिक अधिकार किस भाग में हैं?', options: ['भाग II', 'भाग III', 'भाग IV', 'भाग V'], answer: 1, hint: 'They are placed in Part III, covering Articles 12–35.' },
    { id: 8, question: 'अनुच्छेद 21 किससे संबंधित है?', options: ['समानता का अधिकार', 'जीवन और व्यक्तिगत स्वतंत्रता', 'धार्मिक स्वतंत्रता', 'संवैधानिक उपचार'], answer: 1, hint: 'It protects life and personal liberty.' },
    { id: 9, question: 'कानून के समक्ष समानता किस अनुच्छेद में है?', options: ['अनुच्छेद 12', 'अनुच्छेद 14', 'अनुच्छेद 19', 'अनुच्छेद 21'], answer: 1, hint: 'Article 14 establishes equality before law.' },
    { id: 10, question: 'मौलिक अधिकारों का संरक्षक किसे माना जाता है?', options: ['संसद', 'राष्ट्रपति', 'सर्वोच्च न्यायालय', 'चुनाव आयोग'], answer: 2, hint: 'It protects rights through judicial review and constitutional remedies.' },

{ id: 11, question: 'अनुच्छेद 12 में “State” की परिभाषा किस संदर्भ में दी गई है?', options: ['मौलिक अधिकारों के संदर्भ में', 'नीति-निर्देशक तत्वों के संदर्भ में', 'चुनावों के संदर्भ में', 'आपातकाल के संदर्भ में'], answer: 0, hint: 'Article 12 defines State for Part III.' },

{ id: 12, question: 'अनुच्छेद 12 के अंतर्गत निम्नलिखित में से कौन “State” में शामिल है?', options: ['भारत सरकार और संसद', 'केवल निजी कंपनियाँ', 'केवल राजनीतिक दल', 'केवल विदेशी सरकारें'], answer: 0, hint: 'Think of the Union government and Parliament.' },

{ id: 13, question: 'अनुच्छेद 13 का मुख्य उद्देश्य क्या है?', options: ['उपाधियों को समाप्त करना', 'मौलिक अधिकारों के विरुद्ध कानूनों को उस सीमा तक अमान्य करना', 'अस्पृश्यता समाप्त करना', 'लोक नियोजन में अवसर देना'], answer: 1, hint: 'It protects Fundamental Rights against inconsistent laws.' },

{ id: 14, question: 'अनुच्छेद 14 प्रत्येक व्यक्ति को क्या प्रदान करता है?', options: ['केवल धार्मिक स्वतंत्रता', 'कानून के समक्ष समानता और कानूनों का समान संरक्षण', 'केवल शिक्षा का अधिकार', 'केवल संपत्ति का अधिकार'], answer: 1, hint: 'Article 14 contains two expressions of equality.' },

{ id: 15, question: 'अनुच्छेद 15 के अनुसार राज्य किन आधारों पर भेदभाव नहीं कर सकता?', options: ['धर्म, मूलवंश, जाति, लिंग और जन्मस्थान', 'केवल आय', 'केवल भाषा', 'केवल आयु'], answer: 0, hint: 'Remember the specific grounds listed in Article 15.' },

{ id: 16, question: 'अनुच्छेद 16 किससे संबंधित है?', options: ['धार्मिक स्वतंत्रता', 'लोक नियोजन में अवसर की समानता', 'अस्पृश्यता का उन्मूलन', 'उपाधियों का उन्मूलन'], answer: 1, hint: 'It concerns equality of opportunity in public employment.' },

{ id: 17, question: 'अनुच्छेद 17 किसका उन्मूलन करता है?', options: ['उपाधियों का', 'अस्पृश्यता का', 'भेदभाव का', 'गरीबी का'], answer: 1, hint: 'Its subject is Untouchability.' },

{ id: 18, question: 'अनुच्छेद 18 के अंतर्गत राज्य किन distinctions को बनाए रख सकता है?', options: ['सैन्य या शैक्षणिक distinction', 'केवल राजनीतिक distinction', 'केवल आर्थिक distinction', 'किसी भी प्रकार की उपाधि'], answer: 0, hint: 'Article 18 makes an exception for military and academic distinctions.' },

{ id: 19, question: 'अनुच्छेद 15 में किनके लिए विशेष प्रावधान की अनुमति है?', options: ['महिलाओं, बच्चों तथा सामाजिक और शैक्षिक रूप से पिछड़े वर्गों आदि के लिए', 'केवल सरकारी कर्मचारियों के लिए', 'केवल विदेशी नागरिकों के लिए', 'केवल सांसदों के लिए'], answer: 0, hint: 'Article 15 permits certain special provisions for specified groups.' },

{ id: 20, question: 'अनुच्छेद 13 के अनुसार मौलिक अधिकारों के विरुद्ध कानूनों की स्थिति क्या होगी?', options: ['वे हमेशा पूरी तरह वैध रहेंगे', 'वे उस सीमा तक अमान्य होंगे जिस सीमा तक वे मौलिक अधिकारों के विरुद्ध हैं', 'वे केवल राष्ट्रपति की अनुमति से वैध होंगे', 'वे केवल राज्यों में लागू होंगे'], answer: 1, hint: 'Invalidity applies to the extent of inconsistency with Fundamental Rights.' },
  ],

History: [
  { id: 21, question: 'हड़प्पा सभ्यता का नाम “Harappan Civilization” क्यों पड़ा?', options: ['हड़प्पा इसकी राजधानी थी', 'हड़प्पा वह पहला पहचाना गया स्थल था जिसके आधार पर समान पुरातात्त्विक संस्कृति के अन्य स्थलों को Harappan कहा गया', 'हड़प्पा सबसे बड़ा स्थल था', 'हड़प्पा में सबसे अधिक मोहरें मिलीं'], answer: 1, hint: 'The civilization was named after the site of Harappa.' },

  { id: 22, question: 'मोहनजोदड़ो किसके लिए विशेष रूप से प्रसिद्ध है?', options: ['लोहे के औजार', 'Great Bath', 'अशोक के शिलालेख', 'बौद्ध स्तूप'], answer: 1, hint: 'Think of the famous public bathing structure.' },

  { id: 23, question: 'धोलावीरा किस विशेषता के लिए विशेष रूप से जाना जाता है?', options: ['विशाल लौह-उद्योग', 'उन्नत जल-संचयन और जल-प्रबंधन', 'गुप्तकालीन मंदिर', 'अशोक स्तंभ'], answer: 1, hint: 'Think of reservoirs and water management.' },

  { id: 24, question: 'निम्न में से कौन-सा हड़प्पा स्थल गुजरात में स्थित है?', options: ['हड़प्पा', 'मोहनजोदड़ो', 'लोथल', 'कालीबंगा'], answer: 2, hint: 'This site is associated with maritime trade and Gujarat.' },

  { id: 25, question: 'कालीबंगा किस वर्तमान राज्य में स्थित है?', options: ['गुजरात', 'हरियाणा', 'राजस्थान', 'पंजाब'], answer: 2, hint: 'It is located in north-western India.' },

  { id: 26, question: 'राखीगढ़ी किस वर्तमान राज्य में स्थित प्रमुख हड़प्पा स्थल है?', options: ['हरियाणा', 'राजस्थान', 'गुजरात', 'उत्तर प्रदेश'], answer: 0, hint: 'Think of a major Harappan site in Haryana.' },

  { id: 27, question: 'हड़प्पा नगरों की प्रमुख विशेषताओं में से एक क्या थी?', options: ['व्यवस्थित नगर नियोजन और जल-निकासी', 'केवल लकड़ी के मकान', 'केवल गुफा-आवास', 'लोहे के विशाल दुर्ग'], answer: 0, hint: 'Planned streets and drainage were important features.' },

  { id: 28, question: 'हड़प्पा सभ्यता की लिपि के बारे में वर्तमान स्थिति क्या है?', options: ['पूरी तरह पढ़ ली गई है', 'केवल संस्कृत में लिखी गई थी', 'अभी तक पूरी तरह decipher नहीं हुई है', 'केवल अशोक ने इसका प्रयोग किया'], answer: 2, hint: 'The script remains undeciphered.' },

  { id: 29, question: 'निम्न में से कौन-सा हड़प्पा सभ्यता का प्रमुख स्थल है?', options: ['धोलावीरा', 'नालंदा', 'सारनाथ', 'पाटलिपुत्र'], answer: 0, hint: 'This is a major Harappan site in Gujarat.' },

  { id: 30, question: 'हड़प्पा सभ्यता की पहचान के लिए निम्न में से कौन-सा संयोजन सबसे उपयुक्त है?', options: ['नगर नियोजन + जल-निकासी + विकसित शिल्प', 'लौह तकनीक + अशोक के शिलालेख', 'बौद्ध विहार + स्तूप', 'मंदिर वास्तुकला + संस्कृत अभिलेख'], answer: 0, hint: 'Think of the defining archaeological features of Harappan urban culture.' },
  ],  
  Geography: [
 { id: 21,
  question: "Q21. पृथ्वी के संदर्भ में निम्नलिखित कथनों पर विचार कीजिए:\n1. पृथ्वी सूर्य से तीसरा ग्रह है।\n2. पृथ्वी आंतरिक ग्रहों में सबसे बड़ा है।\n3. पृथ्वी पर जीवन के लिए अनुकूल परिस्थितियाँ पाई जाती हैं।\nसही उत्तर चुनिए:",
  options: [
    "केवल 1",
    "केवल 1 और 2",
    "केवल 2 और 3",
    "1, 2 और 3"
  ],
  answer: 3
},

{
  id: 22,
  question: "Q22. निम्नलिखित में से कौन-सा युग्म सही सुमेलित है?",
  options: [
    "बुध — सबसे बड़ा ग्रह",
    "बृहस्पति — आंतरिक ग्रह",
    "पृथ्वी — सबसे बड़ा आंतरिक ग्रह",
    "नेप्च्यून — सूर्य के सबसे निकट ग्रह"
  ],
  answer: 2
},

{
  id: 23,
  question: "Q23. पृथ्वी पर दिन और रात होने का मुख्य कारण क्या है?",
  options: [
    "सूर्य के चारों ओर पृथ्वी का परिक्रमण",
    "पृथ्वी का अपने अक्ष पर घूर्णन",
    "चंद्रमा का पृथ्वी के चारों ओर परिक्रमण",
    "सूर्य का अपनी धुरी पर घूमना"
  ],
  answer: 1
},

{
  id: 24,
  question: "Q24. यदि पृथ्वी का घूर्णन न हो, तो निम्नलिखित में से कौन-सी घटना सबसे सीधे प्रभावित होगी?",
  options: [
    "दिन और रात का नियमित चक्र",
    "ग्रहों की संख्या",
    "क्षुद्रग्रह पट्टी",
    "सूर्य की ऊर्जा"
  ],
  answer: 0
},

{
  id: 25,
  question: "Q25. तारे और ग्रह के बीच सही अंतर कौन-सा है?",
  options: [
    "ग्रह स्वयं प्रकाश उत्पन्न करते हैं, तारे नहीं।",
    "तारे स्वयं प्रकाश देते हैं, जबकि ग्रह सामान्यतः तारों के प्रकाश को परावर्तित करते हैं।",
    "सभी ग्रह तारों से बड़े होते हैं।",
    "ग्रह केवल दिन में दिखाई देते हैं।"
  ],
  answer: 1
},

{
  id: 26,
  question: "Q26. सौरमंडल के संदर्भ में निम्नलिखित में से कौन-सा कथन सही है?",
  options: [
    "सौरमंडल में केवल सूर्य और आठ ग्रह शामिल हैं।",
    "सौरमंडल में सूर्य, ग्रह, उपग्रह तथा अन्य छोटे खगोलीय पिंड भी शामिल हैं।",
    "सूर्य पृथ्वी का उपग्रह है।",
    "सभी खगोलीय पिंड स्वयं प्रकाश देते हैं।"
  ],
  answer: 1
},

{
  id: 27,
  question: "Q27. निम्नलिखित में से कौन-सा समूह आंतरिक/स्थलीय ग्रहों का है?",
  options: [
    "बुध, शुक्र, पृथ्वी, मंगल",
    "पृथ्वी, मंगल, बृहस्पति, शनि",
    "बृहस्पति, शनि, यूरेनस, नेप्च्यून",
    "बुध, पृथ्वी, शनि, नेप्च्यून"
  ],
  answer: 0
},

{
  id: 28,
  question: "Q28. पृथ्वी को जीवन के लिए अनुकूल ग्रह बनाने में निम्नलिखित में से कौन-कौन से कारक महत्वपूर्ण हैं?\n1. सूर्य से उपयुक्त दूरी\n2. तरल जल की उपलब्धता\n3. अनुकूल वायुमंडलीय परिस्थितियाँ",
  options: [
    "केवल 1",
    "केवल 1 और 2",
    "केवल 2 और 3",
    "1, 2 और 3"
  ],
  answer: 3
},

{
  id: 29,
  question: "Q29. निम्नलिखित में से कौन-सा कथन सही है?",
  options: [
    "सूर्य एक ग्रह है और पृथ्वी एक तारा।",
    "सूर्य सौरमंडल का केंद्र है और पृथ्वी उसका एक ग्रह है।",
    "चंद्रमा स्वयं प्रकाश उत्पन्न करता है।",
    "पृथ्वी सौरमंडल का सबसे बड़ा ग्रह है।"
  ],
  answer: 1
},

{
  id: 30,
  question: "Q30. एक विद्यार्थी कहता है— 'पृथ्वी की सूर्य से उचित दूरी होने के कारण ही पृथ्वी पर जीवन संभव है।' इस कथन के बारे में सबसे उपयुक्त उत्तर क्या है?",
  options: [
    "कथन पूर्णतः सही है; केवल दूरी ही पर्याप्त है।",
    "कथन गलत है; दूरी का कोई महत्व नहीं है।",
    "दूरी महत्वपूर्ण है, लेकिन जल, वायुमंडल और अन्य अनुकूल परिस्थितियाँ भी आवश्यक हैं।",
    "केवल पृथ्वी का आकार जीवन के लिए जिम्मेदार है।"
  ],
  answer: 2
} 
  Economy: [
    { id: 301, question: 'भारतीय रिजर्व बैंक का मुख्य कार्य क्या है?', options: ['कर वसूलना', 'मौद्रिक नीति का संचालन', 'बजट प्रस्तुत करना', 'जनगणना करना'], answer: 1, hint: 'It steers money and credit in the economy.' },
    { id: 302, question: 'GDP का अर्थ क्या है?', options: ['सकल घरेलू उत्पाद', 'कुल विकास योजना', 'सामान्य जमा नीति', 'सकल ऋण प्रावधान'], answer: 0, hint: 'It measures the value of final goods and services.' },
    { id: 303, question: 'राजकोषीय घाटा किसके बीच का अंतर है?', options: ['निर्यात और आयात', 'सरकारी व्यय और कुल प्राप्तियाँ', 'बचत और निवेश', 'मांग और आपूर्ति'], answer: 1, hint: 'Think about the government’s annual accounts.' },
  ],
  Environment: [
    { id: 401, question: 'रामसर संधि किससे संबंधित है?', options: ['आर्द्रभूमि संरक्षण', 'वन्यजीव व्यापार', 'जलवायु वित्त', 'समुद्री सुरक्षा'], answer: 0, hint: 'The convention is named after a city in Iran.' },
    { id: 402, question: 'ओजोन परत मुख्यतः किस मंडल में पाई जाती है?', options: ['क्षोभमंडल', 'समतापमंडल', 'मध्यमंडल', 'बहिर्मंडल'], answer: 1, hint: 'It is above the weather-making layer.' },
    { id: 403, question: 'भारत का पहला राष्ट्रीय उद्यान कौन सा है?', options: ['काजीरंगा', 'जिम कॉर्बेट', 'गिर', 'कान्हा'], answer: 1, hint: 'It was earlier known as Hailey National Park.' },
  ],
  'Science & Tech': [
    { id: 501, question: 'ISRO का मुख्यालय किस शहर में स्थित है?', options: ['चेन्नई', 'हैदराबाद', 'बेंगलुरु', 'नई दिल्ली'], answer: 2, hint: 'India’s space city.' },
    { id: 502, question: 'CRISPR तकनीक का उपयोग मुख्यतः किसके लिए किया जाता है?', options: ['जीन संपादन', 'मौसम पूर्वानुमान', 'रॉकेट ईंधन', 'भूकंप मापन'], answer: 0, hint: 'It can make precise changes in DNA.' },
    { id: 503, question: '5G में “G” किसका संक्षिप्त रूप है?', options: ['Global', 'Generation', 'Gateway', 'Graphical'], answer: 1, hint: 'It follows 4G.' },
  ],
};

const defaultNotes: Note[] = [
  { id: 1, title: 'Article 32 — the heart and soul', body: 'Dr. B. R. Ambedkar described Article 32 as the heart and soul of the Constitution. It makes Fundamental Rights enforceable through the Supreme Court.', subject: 'Polity', createdAt: 'Today' },
  { id: 2, title: 'A calm revision rule', body: 'Read the article. Close the book. Explain it in two lines. Then test the edges with one question.', subject: 'Polity', createdAt: 'Yesterday' },
];

const defaultStats: Stats = { sessions: 0, minutes: 0, mcqs: 0, best: 0, last: null, tests: 0, bestPercentage: 0 };

function getStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function shuffleQuestions(list: Question[]) {
  return [...list].sort(() => Math.random() - 0.5);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function BrandMark() {
  return <div className="brand-mark" aria-hidden="true"><span>SS</span><i /></div>;
}

function App() {
  const [dark, setDark] = useState(() => getStored('study-dark', false));
  const [mobileNav, setMobileNav] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState(() => getStored('study-subject', 'Polity'));
  const [topicsDone, setTopicsDone] = useState<string[]>(() => getStored('study-topics', []));
  const [notes, setNotes] = useState<Note[]>(() => getStored<Note[]>('study-notes', defaultNotes).map((note) => ({ ...note, subject: note.subject || 'Polity' })));
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStored('study-history', []));
  const [stats, setStats] = useState<Stats>(() => ({ ...defaultStats, ...getStored('study-stats', defaultStats) }));
  const [seconds, setSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMessage, setTimerMessage] = useState('A small beginning is still a beginning.');
  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilter, setNoteFilter] = useState('All');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteSubject, setNoteSubject] = useState(() => getStored('study-subject', 'Polity'));
  const [quizSubject, setQuizSubject] = useState(() => getStored('study-subject', 'Polity'));
  const [quizMode, setQuizMode] = useState<QuizMode>('standard');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>(questionBanks.Polity);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(90);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('study-dark', JSON.stringify(dark)); }, [dark]);
  useEffect(() => localStorage.setItem('study-topics', JSON.stringify(topicsDone)), [topicsDone]);
  useEffect(() => localStorage.setItem('study-notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('study-history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('study-stats', JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem('study-subject', JSON.stringify(selectedSubject)), [selectedSubject]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) {
        window.clearInterval(interval);
        setTimerRunning(false);
        setTimerMessage('Session complete. Five quiet minutes, well spent.');
        setStats((old) => ({ ...old, sessions: old.sessions + 1, minutes: old.minutes + 5 }));
        return 300;
      }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (quizMode !== 'timed' || quizSubmitted || quizTimeLeft <= 0) return;
    const interval = window.setInterval(() => setQuizTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [quizMode, quizSubmitted, quizTimeLeft]);

  useEffect(() => {
    if (quizMode === 'timed' && quizTimeLeft === 0 && !quizSubmitted) submitQuiz();
  }, [quizTimeLeft, quizMode, quizSubmitted]);

  useEffect(() => {
    const ids = ['home', 'subjects', 'progress', 'timer', 'notes', 'mcq', 'history'];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.1, 0.35, 0.7] });
    ids.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const topicPercent = Math.round((topicsDone.length / topics.length) * 100);
  const dailyPercent = Math.min(100, Math.round((stats.minutes / 120) * 100));
  const filteredNotes = useMemo(() => {
    const query = noteSearch.trim().toLowerCase();
    return notes.filter((note) => (noteFilter === 'All' || note.subject === noteFilter) && (!query || `${note.title} ${note.body} ${note.subject}`.toLowerCase().includes(query)));
  }, [notes, noteSearch, noteFilter]);
  const currentQuestion = quizQuestions[quizIndex] || questionBanks[quizSubject][0];
  const answerSelected = answers[currentQuestion.id];
  const quizPercent = quizSubmitted ? Math.round((quizScore / quizQuestions.length) * 100) : 0;

  const navigate = (id: string) => { setMobileNav(false); scrollToId(id); };
  const startStudying = () => { navigate('timer'); setTimerRunning(true); setTimerMessage('Your desk is ready. Stay with the next five minutes.'); };
  const toggleTopic = (id: string) => setTopicsDone((current) => current.includes(id) ? current.filter((topicId) => topicId !== id) : [...current, id]);

  const beginQuiz = (subject: string, mode: QuizMode) => {
    const bank = questionBanks[subject] || questionBanks.Polity;
    setQuizSubject(subject);
    setQuizMode(mode);
    setQuizQuestions(mode === 'random' ? shuffleQuestions(bank) : [...bank]);
    setQuizIndex(0);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizTimeLeft(mode === 'timed' ? 90 : 0);
  };

  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setNoteSubject(subject);
    setQuizSubject(subject);
    beginQuiz(subject, quizMode);
  };

  const addNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;
    setNotes((current) => [{ id: Date.now(), title: noteTitle.trim(), body: noteBody.trim(), subject: noteSubject, createdAt: 'Just now' }, ...current]);
    setNoteTitle('');
    setNoteBody('');
  };

  const submitQuiz = () => {
    if (quizSubmitted) return;
    const score = quizQuestions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const attempt: HistoryEntry = { id: Date.now(), subject: quizSubject, score, total: quizQuestions.length, percentage, date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()), mode: quizMode };
    setQuizScore(score);
    setQuizSubmitted(true);
    setHistory((old) => [attempt, ...old]);
    setStats((old) => ({ ...old, mcqs: old.mcqs + quizQuestions.length, best: Math.max(old.best, score), bestPercentage: Math.max(old.bestPercentage, percentage), last: score, tests: old.tests + 1 }));
  };

  const resetQuiz = () => beginQuiz(quizSubject, quizMode);

  const resetProgress = () => {
    if (!window.confirm('Reset progress? This will permanently remove your topics, notes, quiz history, and dashboard totals from this device.')) return;
    setTopicsDone([]);
    setNotes(defaultNotes);
    setHistory([]);
    setStats(defaultStats);
    setNoteSearch('');
    setNoteFilter('All');
    beginQuiz(selectedSubject, 'standard');
    localStorage.removeItem('study-topics');
    localStorage.removeItem('study-notes');
    localStorage.removeItem('study-history');
    localStorage.removeItem('study-stats');
  };

  return (
    <div className="study-app">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <button className="brand-button" onClick={() => navigate('home')} data-testid="button-brand" aria-label="Go to Study Space home"><BrandMark /><span className="brand-copy"><strong>Study Space</strong><small>UPSC 2027 · command center</small></span></button>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} data-testid="button-close-navigation" aria-label="Close navigation"><X size={19} /></button>
        </div>
        <div className="side-rule" />
        <p className="eyebrow side-label">Your study room</p>
        <nav className="side-nav" aria-label="Main navigation">
          {[
            { id: 'home', label: 'Today', icon: Compass },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'progress', label: 'My progress', icon: Target },
            { id: 'timer', label: 'Focus timer', icon: Clock3 },
            { id: 'notes', label: 'Study notes', icon: NotebookPen },
            { id: 'mcq', label: 'Practice quiz', icon: FileText },
            { id: 'history', label: 'Test history', icon: HistoryIcon },
          ].map(({ id, label, icon: Icon }) => <button key={id} className={`side-link ${activeSection === id ? 'active' : ''}`} onClick={() => navigate(id)} data-testid={`nav-${id}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{activeSection === id && <i />}</button>)}
        </nav>
        <div className="sidebar-foot">
          <div className="quote-card"><Sparkles size={16} /><p>“The mind is not a vessel to be filled, but a fire to be kindled.”</p><small>— Plutarch</small></div>
          <button className="theme-toggle" onClick={() => setDark((value) => !value)} data-testid="button-theme-toggle">{dark ? <Sun size={17} /> : <Moon size={17} />}<span>{dark ? 'Light room' : 'Dark room'}</span><span className="toggle-track"><i className={dark ? 'on' : ''} /></span></button>
          <button className="reset-progress-button" onClick={resetProgress} data-testid="button-reset-progress"><RotateCcw size={14} /> Reset progress</button>
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} data-testid="button-navigation-scrim" aria-label="Close navigation" />}

      <main className="main-content">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileNav(true)} data-testid="button-open-navigation" aria-label="Open navigation"><Menu size={20} /></button>
          <button className="mobile-brand" onClick={() => navigate('home')} data-testid="button-mobile-brand"><BrandMark /><strong>Study Space</strong></button>
          <button className="icon-button" onClick={() => setDark((value) => !value)} data-testid="button-mobile-theme" aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </header>
        <div className="content-wrap">
          <section id="home" className="hero-section">
            <div className="hero-topline"><span className="status-dot" /><span>UPSC 2027 · Tuesday, 18 June 2024</span><span className="topline-line" /><span>Command center</span></div>
            <div className="hero-grid">
              <div className="hero-copy"><p className="eyebrow">Namaste, learner</p><h1>Make room for<br /><em>one clear thought.</em></h1><p className="hero-intro">यहाँ आपकी UPSC 2027 तैयारी को थोड़ी शांति मिलती है। Choose a subject, work the next small block, and keep your place.</p><div className="hero-actions"><button className="button button-primary" onClick={startStudying} data-testid="button-start-studying"><Play size={16} fill="currentColor" /> Start a focus session <ArrowRight size={15} /></button><button className="text-button" onClick={() => navigate('subjects')} data-testid="button-view-subjects">Choose a subject <ArrowRight size={14} /></button></div></div>
              <div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-book"><div /><div /><div /></div><span className="art-caption">अध्ययन<br /><small>quiet work, daily</small></span><div className="art-stamp">27<br /><small>UPSC</small></div></div>
            </div>
            <div className="today-strip"><div><span className="strip-label">Current subject</span><strong>{selectedSubject} <small>{subjects.find((subject) => subject.id === selectedSubject)?.hindi}</small></strong></div><div className="streak"><Flame size={17} /><strong>{stats.sessions + 2} day streak</strong><span>Keep the thread alive</span></div><button className="strip-arrow" onClick={() => navigate('timer')} data-testid="button-strip-timer" aria-label="Go to focus timer"><ArrowRight size={18} /></button></div>
          </section>

          <section className="dashboard-section" aria-labelledby="dashboard-title">
            <div className="section-heading"><div><p className="eyebrow">UPSC 2027 study command center</p><h2 id="dashboard-title">The desk, at a glance</h2></div><span className="section-number">01 / 07</span></div>
            <div className="metric-grid">
              <div className="metric-card metric-feature"><div className="metric-icon warm"><Clock3 size={18} /></div><span>Study sessions</span><strong data-testid="text-dashboard-sessions">{stats.sessions}</strong><small>completed in this space</small></div>
              <div className="metric-card"><div className="metric-icon teal"><Zap size={18} /></div><span>Study time</span><strong data-testid="text-dashboard-time">{stats.minutes}<b> min</b></strong><small>of 120 min daily goal</small><div className="mini-progress"><i style={{ width: `${dailyPercent}%` }} /></div></div>
              <div className="metric-card"><div className="metric-icon plum"><NotebookPen size={18} /></div><span>Notes saved</span><strong data-testid="text-dashboard-notes">{notes.length}</strong><small>across {subjects.length} subjects</small></div>
              <div className="metric-card"><div className="metric-icon teal"><FileText size={18} /></div><span>Tests taken</span><strong data-testid="text-dashboard-tests">{stats.tests}</strong><small>{stats.last === null ? 'No test attempted yet' : `Last score: ${stats.last}`}</small></div>
              <div className="metric-card"><div className="metric-icon plum"><Trophy size={18} /></div><span>Best percentage</span><strong data-testid="text-dashboard-best-percentage">{stats.bestPercentage}<b> %</b></strong><small>your sharpest attempt</small></div>
              <div className="metric-card"><div className="metric-icon warm"><CheckCircle2 size={18} /></div><span>Solved questions</span><strong data-testid="text-dashboard-solved">{stats.mcqs}</strong><small>questions met head-on</small></div>
              <div className="metric-card metric-goal"><div className="goal-ring" style={{ '--progress': `${dailyPercent * 3.6}deg` } as React.CSSProperties}><span>{dailyPercent}<small>%</small></span></div><div><span>Daily goal</span><strong>{stats.minutes >= 120 ? 'Complete' : `${Math.max(0, 120 - stats.minutes)} min left`}</strong><small>Two hours, in small pieces.</small></div></div>
            </div>
          </section>

          <section id="subjects" className="workspace-section subjects-section" aria-labelledby="subjects-title">
            <div className="section-heading"><div><p className="eyebrow">Your six-lane preparation</p><h2 id="subjects-title">Choose your ground.</h2></div><span className="section-number">02 / 07</span></div>
            <div className="subjects-heading-line"><p>Selecting a subject carries through to your next note and quiz.</p><span>Selected: <strong>{selectedSubject}</strong></span></div>
            <div className="subject-grid" data-testid="list-subjects">{subjects.map((subject, index) => <button key={subject.id} className={`subject-card ${selectedSubject === subject.id ? 'selected' : ''}`} onClick={() => selectSubject(subject.id)} data-testid={`subject-${subject.id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`} aria-pressed={selectedSubject === subject.id}><span className="subject-index">0{index + 1}</span><span className="subject-name"><strong>{subject.label}</strong><small>{subject.hindi}</small></span><span className="subject-note">{subject.note}</span><span className="subject-select">{selectedSubject === subject.id ? <Check size={15} /> : <ArrowRight size={15} />}</span></button>)}</div>
          </section>

          <section id="progress" className="workspace-section progress-section" aria-labelledby="progress-title">
            <div className="section-heading"><div><p className="eyebrow">Polity · Fundamental Rights</p><h2 id="progress-title">Keep your place</h2></div><span className="section-number">03 / 07</span></div>
            <div className="progress-layout"><div className="progress-overview"><div className="big-progress-number">{topicPercent}<span>%</span></div><p>of today’s constitutional reading is in your long-term memory.</p><div className="line-progress"><i style={{ width: `${topicPercent}%` }} /></div><div className="progress-meta"><span>{topicsDone.length} topics checked</span><span>{topics.length - topicsDone.length} to revisit</span></div><div className="progress-note"><CheckCircle2 size={16} /><span>Small checkmarks compound into confidence.</span></div></div><div className="topic-list" data-testid="list-topics">{topics.map((topic) => { const done = topicsDone.includes(topic.id); return <button key={topic.id} className={`topic-row ${done ? 'done' : ''}`} onClick={() => toggleTopic(topic.id)} data-testid={`topic-${topic.id}`} aria-pressed={done}><span className="topic-check">{done && <Check size={14} strokeWidth={3} />}</span><span className="topic-label"><strong>{topic.english}</strong><span>{topic.hindi}</span></span><span className="topic-detail">{topic.detail}</span><ArrowRight size={15} className="topic-arrow" /></button>; })}</div></div>
          </section>

          <section id="timer" className="workspace-section timer-section" aria-labelledby="timer-title">
            <div className="section-heading"><div><p className="eyebrow">Focus room</p><h2 id="timer-title">Five minutes, fully yours.</h2></div><span className="section-number">04 / 07</span></div>
            <div className="timer-panel"><div className="timer-side"><span className={`pulse ${timerRunning ? 'running' : ''}`} /><span>{timerRunning ? 'In session' : 'Ready when you are'}</span><p>Put the phone down. Follow the next sentence.</p></div><div className={`timer-clock ${timerRunning ? 'is-running' : ''}`} data-testid="text-timer">{formatTime(seconds)}</div><div className="timer-actions"><button className="button button-primary" onClick={() => { setTimerRunning(true); setTimerMessage('The only task is to stay here.'); }} disabled={timerRunning} data-testid="button-timer-start"><Play size={15} fill="currentColor" /> Start</button><button className="button button-quiet" onClick={() => { setTimerRunning(false); setTimerMessage('Paused. Your place is safe.'); }} disabled={!timerRunning} data-testid="button-timer-pause"><Pause size={15} /> Pause</button><button className="icon-button timer-reset" onClick={() => { setTimerRunning(false); setSeconds(300); setTimerMessage('A small beginning is still a beginning.'); }} data-testid="button-timer-reset" aria-label="Reset timer"><RotateCcw size={17} /></button></div><p className="timer-message" data-testid="status-timer">{timerMessage}</p></div>
          </section>

          <section id="notes" className="workspace-section notes-section" aria-labelledby="notes-title">
            <div className="section-heading"><div><p className="eyebrow">Your second brain</p><h2 id="notes-title">Notes worth returning to.</h2></div><span className="section-number">05 / 07</span></div>
            <div className="notes-layout"><form className="note-form" onSubmit={addNote}><div className="note-form-heading"><NotebookPen size={19} /><span>New note</span><small>Saved locally</small></div><label><span>Title</span><input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="e.g. Article 21 in one line" data-testid="input-note-title" /></label><label><span>Subject</span><select value={noteSubject} onChange={(event) => setNoteSubject(event.target.value)} data-testid="select-note-subject">{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.label} · {subject.hindi}</option>)}</select></label><label><span>Your thought</span><textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="Write the idea in your own words..." rows={5} data-testid="input-note-body" /></label><button className="button button-primary note-submit" type="submit" data-testid="button-add-note"><Plus size={16} /> Add note</button></form><div className="notes-library"><div className="library-top"><div><span className="eyebrow">Library <b>{notes.length}</b></span><strong>Recent fragments</strong></div><label className="search-field"><Search size={16} /><input type="search" value={noteSearch} onChange={(event) => setNoteSearch(event.target.value)} placeholder="Search your notes" data-testid="input-note-search" /></label></div><div className="note-filters" role="group" aria-label="Filter notes by subject"><button className={noteFilter === 'All' ? 'active' : ''} onClick={() => setNoteFilter('All')} data-testid="button-filter-notes-all">All <span>{notes.length}</span></button>{subjects.map((subject) => <button key={subject.id} className={noteFilter === subject.id ? 'active' : ''} onClick={() => setNoteFilter(subject.id)} data-testid={`button-filter-notes-${subject.id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}>{subject.label}</button>)}</div>{filteredNotes.length === 0 ? <div className="empty-state"><FileText size={26} /><strong>No notes found</strong><p>Try another phrase, or make a new note on the left.</p></div> : <div className="notes-list">{filteredNotes.map((note) => <article className="note-card" key={note.id} data-testid={`card-note-${note.id}`}><div className="note-card-top"><span>{note.createdAt}</span><button className="delete-button" onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))} data-testid={`button-delete-note-${note.id}`} aria-label={`Delete ${note.title}`}><Trash2 size={15} /></button></div><span className="note-subject-chip">{note.subject}</span><h3>{note.title}</h3>
<p>{note.body}</p>

{note.subject === 'History' &&
  (note.title.toLowerCase().includes('harappan') ||
   note.title.includes('हड़प्पा')) && (
    <img
      src="/harappan_original_map.png"
      alt="Harappan Civilization important sites map"
      style={{
        width: '100%',
        marginTop: '16px',
        borderRadius: '12px',
        display: 'block',
      }}
    />
  )}</article>)}</div>}</div></div>
          </section>

          <section id="mcq" className="workspace-section quiz-section" aria-labelledby="quiz-title">
            <div className="section-heading"><div><p className="eyebrow">UPSC 2027 · practice lab</p><h2 id="quiz-title">Test the edges of memory.</h2></div><span className="section-number">06 / 07</span></div>
            <div className="quiz-controls"><div className="quiz-selector"><label>Subject<select value={quizSubject} onChange={(event) => beginQuiz(event.target.value, quizMode)} data-testid="select-quiz-subject">{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.label} · {subject.hindi}</option>)}</select></label></div><div className="mode-picker" role="group" aria-label="Test mode"><span>Mode</span>{(['standard', 'random', 'timed'] as QuizMode[]).map((mode) => <button key={mode} className={quizMode === mode ? 'active' : ''} onClick={() => beginQuiz(quizSubject, mode)} data-testid={`button-quiz-mode-${mode}`}>{mode === 'standard' ? 'Study set' : mode === 'random' ? 'Random test' : 'Timed test'}</button>)}</div></div>
            {!quizSubmitted ? <div className="quiz-wrap"><div className="quiz-progress-top"><span>{quizSubject} · {quizMode === 'timed' ? <b className="countdown-label"><Clock3 size={12} /> {formatTime(quizTimeLeft)}</b> : quizMode === 'random' ? 'mixed order' : 'study set'}</span><strong>0{quizIndex + 1} <i>/ {String(quizQuestions.length).padStart(2, '0')}</i></strong></div><div className="quiz-progress"><i style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} /></div><div className="quiz-question"><span className="question-kicker">Question {quizIndex + 1}</span><h3>{currentQuestion.question}</h3><div className="options">{currentQuestion.options.map((option, index) => <label key={option} className={`option ${answerSelected === index ? 'selected' : ''}`}><input type="radio" name={`question-${currentQuestion.id}`} checked={answerSelected === index} onChange={() => setAnswers((old) => ({ ...old, [currentQuestion.id]: index }))} data-testid={`radio-answer-${currentQuestion.id}-${index}`} /><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answerSelected === index && <Check size={16} />}</label>)}</div><p className="quiz-hint"><Sparkles size={14} /> {currentQuestion.hint}</p></div><div className="quiz-nav"><button className="button button-quiet" onClick={() => setQuizIndex((value) => Math.max(0, value - 1))} disabled={quizIndex === 0} data-testid="button-quiz-previous"><ChevronLeft size={16} /> Previous</button>{quizIndex === quizQuestions.length - 1 ? <button className="button button-primary" onClick={submitQuiz} data-testid="button-quiz-submit">Submit answers <Check size={16} /></button> : <button className="button button-primary" onClick={() => setQuizIndex((value) => Math.min(quizQuestions.length - 1, value + 1))} data-testid="button-quiz-next">Next question <ChevronRight size={16} /></button>}</div></div> : <div className="quiz-result"><div className="result-medal"><Trophy size={28} /></div><p className="eyebrow">Your result · {quizSubject}</p><h3>{quizScore === quizQuestions.length ? 'A clear, confident read.' : quizScore >= Math.ceil(quizQuestions.length * .65) ? 'Good work. Keep the thread.' : 'The gaps are useful. Revisit and return.'}</h3><div className="result-score"><strong>{quizScore}</strong><span>/ {quizQuestions.length}<small>correct answers</small></span></div><div className="result-bar"><i style={{ width: `${quizPercent}%` }} /></div><p className="result-copy">You answered {quizScore} of {quizQuestions.length} questions correctly. This attempt is now in your test history.</p><button className="button button-primary" onClick={resetQuiz} data-testid="button-quiz-retry"><RotateCcw size={15} /> Try again</button></div>}
          </section>

          <section id="history" className="workspace-section history-section" aria-labelledby="history-title">
            <div className="section-heading"><div><p className="eyebrow">A record of showing up</p><h2 id="history-title">Test history.</h2></div><span className="section-number">07 / 07</span></div>
            <div className="history-toolbar"><p>{history.length ? 'Each attempt is a useful marker, not a verdict.' : 'Your completed tests will settle here, one attempt at a time.'}</p>{history.length > 0 && <button className="text-button danger-text" onClick={() => { if (window.confirm('Clear all test history from this device?')) setHistory([]); }} data-testid="button-clear-history"><Trash2 size={14} /> Clear history</button>}</div>
            {history.length === 0 ? <div className="history-empty"><HistoryIcon size={26} /><strong>No attempts yet</strong><span>Choose a subject above and take your first test.</span></div> : <div className="history-list" data-testid="list-test-history">{history.map((attempt) => <div className="history-row" key={attempt.id} data-testid={`history-row-${attempt.id}`}><span className="history-date">{attempt.date}</span><span className="history-subject"><strong>{attempt.subject}</strong><small>{attempt.mode === 'timed' ? 'Timed test' : attempt.mode === 'random' ? 'Random test' : 'Study set'}</small></span><span className="history-score"><strong>{attempt.score} / {attempt.total}</strong><small>correct</small></span><span className="history-percentage">{attempt.percentage}%</span></div>)}</div>}
          </section>
          <footer><BrandMark /><span>Study Space · UPSC 2027</span><span className="footer-line" /><span>Built for the long read.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
