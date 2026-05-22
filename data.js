/* ════════════ STATE ════════════ */
const S = {
  nav:{orgName:'جمعية العناية بالمساجد',orgSub:'KSA Mosque Care Foundation',donBtn:'تبرّع الآن',donUrl:'#',
    items:[
      {label:'الرئيسية',url:'home',hasDrop:false,dropItems:[]},
      {label:'من نحن',url:'about',hasDrop:true,dropItems:[{label:'الرؤية والرسالة',icon:'◈',type:'text'},{label:'مجلس الإدارة',icon:'👥',type:'text'},{label:'الهيكل التنظيمي',icon:'📋',type:'pdf'}]},
      {label:'المشاريع',url:'projects',hasDrop:false,dropItems:[]},
      {label:'استطلاعات الرأي',url:'surveys-sec',hasDrop:true,dropItems:[
        {label:'قائمة الاستطلاعات',icon:'📋',type:'text',svTab:'list'},
        {label:'نتائج الاستطلاعات',icon:'📊',type:'text',svTab:'results'},
        {label:'تقارير التحليل',icon:'🔬',type:'pdfgroup',svTab:'analysis'},
        {label:'توصيات المجلس',icon:'🏛',type:'pdf',svTab:'board'},
      ]},
      {label:'الأخبار',url:'news',hasDrop:false,dropItems:[]},
      {label:'الحوكمة',url:'#',hasDrop:true,dropItems:[
        {label:'الوثائق والتقارير',icon:'📄',type:'pdf',page:'docs'},
        {label:'الشكاوى والمقترحات',icon:'💬',type:'text',page:'complaints'},
        {label:'نماذج التسجيل',icon:'📋',type:'text',page:'register'},
      ]},
      {label:'تواصل معنا',url:'p-ft-sec',hasDrop:false,dropItems:[]},
    ]},
  wa:{phone:'966500000000',label:'تواصل معنا',show:true},
  hero:{badge:'🌙 منذ 1440 هـ · رعاية · تطوير · استدامة',em:'بيوت الله',rest:'لتبقى شامخةً بالعبادة',sub:'جمعية خيرية متخصصة في صيانة وتطوير المساجد عبر المملكة العربية السعودية',btn1:'🏗 استعرض مشاريعنا',btn2:'📋 شارك في الاستطلاع',bg1:'#082918',bg2:'#1a5c3a',dir:'145deg'},
  achiev:[
    {icon:'🕌',label:'المساجد المخدومة',val:'1,240',unit:'مسجد'},
    {icon:'💧',label:'مشاريع المياه',val:'586',unit:'مشروع'},
    {icon:'❄️',label:'محطات التبريد',val:'11',unit:'محطة'},
    {icon:'👥',label:'المستفيدون',val:'25,000',unit:'مستفيد'},
    {icon:'🏗',label:'المتطوعون',val:'340',unit:'متطوع'},
    {icon:'📍',label:'المناطق',val:'15',unit:'منطقة'},
  ],
  stats:[{val:'1,240',label:'مسجد تمت خدمته'},{val:'18,500',label:'متبرع كريم'},{val:'340',label:'مشروع مكتمل'},{val:'15',label:'منطقة مغطاة'}],
  projects:[
    {icon:'💡',bg:'#e8f2ec',name:'تركيب الطاقة الشمسية',desc:'تزويد 120 مسجداً بالطاقة النظيفة في منطقة عسير والجنوب',pct:82,goal:100000,cur:82000},
    {icon:'💧',bg:'#fef6e4',name:'صيانة دورات المياه',desc:'ترميم وتجديد مرافق الوضوء في 60 مسجداً بالمناطق الريفية',pct:55,goal:80000,cur:44000},
    {icon:'📚',bg:'#e6f0fb',name:'مكتبات رقمية',desc:'توفير محتوى رقمي وأجهزة ذكية لمكتبات 30 مسجداً في المدن',pct:24,goal:50000,cur:12000},
  ],
  partners:[
    {icon:'🏛',name:'وزارة الشؤون الإسلامية',color:'#1a5c3a'},
    {icon:'🏠',name:'صندوق تطوير المساجد',color:'#c9a227'},
    {icon:'💼',name:'أرامكو السعودية',color:'#378ADD'},
    {icon:'🏥',name:'الهلال الأحمر',color:'#e24b4a'},
    {icon:'🏦',name:'بنك التنمية الاجتماعية',color:'#533AB7'},
  ],
  news:[
    {cat:'إنجاز',cBg:'#c9a227',cTx:'#0f3d26',bg:'#1a5c3a',title:'اكتمال الطاقة الشمسية في عسير',date:'15 أبريل 2026',excerpt:'اكتمال المرحلة الأولى من مشروع الطاقة الشمسية في 45 مسجداً بتمويل 3 ملايين ريال.',content:'اكتمال المرحلة الأولى من مشروع الطاقة الشمسية في 45 مسجداً بتمويل 3 ملايين ريال. تمثل هذا الإنجاز ثمرة جهود متواصلة من فريق الجمعية على مدار 8 أشهر.',imgUrl:'',images:[]},
    {cat:'شراكة',cBg:'#1a5c3a',cTx:'#fff',bg:'#c9a227',title:'اتفاقية مع صندوق تطوير المساجد',date:'10 أبريل 2026',excerpt:'توقيع اتفاقية إطارية لصيانة 500 مسجد سنوياً بتمويل مشترك وآليات شفافة.'},
    {cat:'مبادرة',cBg:'#c9a227',cTx:'#0f3d26',bg:'#378add',title:'إطلاق مبادرة مساجد خضراء',date:'5 أبريل 2026',excerpt:'تحويل 200 مسجد إلى منشآت صديقة للبيئة بالطاقة الشمسية وترشيد المياه.'},
  ],
  events:[
    {day:'22',month:'أبر',title:'ورشة معايير الصيانة الوقائية',meta:'مركز الملك عبدالله · الرياض · 10:00 ص',status:'live'},
    {day:'30',month:'أبر',title:'حفل تكريم المتبرعين والشركاء',meta:'فندق الفيصلية · الرياض · 7:00 م',status:'upcoming'},
    {day:'8',month:'مايو',title:'جولة ميدانية في المنطقة الشرقية',meta:'الدمام والأحساء · يوم كامل',status:'upcoming'},
  ],
  testimonials:[
    {name:'أحمد الغامدي',role:'إمام مسجد · أبها',quote:'لقد تحوّل مسجدنا تماماً بعد مشروع الصيانة — بارك الله فيهم.',color:'#1a5c3a',initials:'أح'},
    {name:'سعد الحارثي',role:'متبرع دائم · الرياض',quote:'الشفافية والمتابعة الميدانية جعلتني أثق بهم تماماً.',color:'#c9a227',txColor:'#0f3d26',initials:'سع'},
    {name:'منصور العتيبي',role:'عضو مجلس بلدي · جدة',quote:'رأيت التحول بأم عيني — مبادرة تستحق الدعم.',color:'#378ADD',initials:'من'},
    {name:'فاطمة الأحمدي',role:'ولية أمر · مكة',quote:'خدمة احترافية وفريق متميز.',color:'#c9a227',txColor:'#0f3d26',initials:'فا'},
    {name:'عبدالرحمن النعيم',role:'رجل أعمال · الدمام',quote:'استثمرت في مشروع الطاقة الشمسية وكانت النتائج رائعة.',color:'#1a5c3a',initials:'عر'},
  ],
  scrollSpeed:5,
  surveys:[
    {id:1,icon:'🔧',iconBg:'#e8f2ec',title:'استطلاع جودة الصيانة Q1 2026',desc:'قيّم جودة أعمال الصيانة المنفذة في مسجدك خلال الربع الأول',cat:'جودة الخدمة',status:'open',responses:847,
     questions:[
       {text:'ما مدى رضاك عن جودة أعمال الصيانة المنفذة؟',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','جيد جداً','ممتاز']},
       {text:'هل التزم الفريق بالمواعيد المحددة؟',type:'radio',required:true,opts:['لا أبداً','أحياناً','غالباً','دائماً']},
       {text:'ما نوع الخدمة التي استفدت منها؟',type:'dropdown',required:true,opts:['كهربائية','سباكة','دهانات','تبريد','أخرى']},
       {text:'هل توصي الآخرين بالتواصل مع الجمعية؟',type:'likert',required:true,opts:['لا','ربما','نعم','بكل تأكيد']},
       {text:'ملاحظاتك واقتراحاتك',type:'text',required:false,opts:[]},
     ]},
    {id:2,icon:'💡',iconBg:'#fef6e4',title:'رضا مستفيدي الطاقة الشمسية',desc:'شاركنا تجربتك مع مشروع تركيب الألواح الشمسية في مسجدك',cat:'المشاريع',status:'open',responses:312,
     questions:[
       {text:'كيف تقيّم أداء الطاقة الشمسية بعد التركيب؟',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','ممتاز']},
       {text:'هل لاحظت انخفاضاً في فاتورة الكهرباء؟',type:'radio',required:true,opts:['لا','نعم قليلاً','نعم بشكل ملحوظ','لا أعلم']},
       {text:'تعليقاتك الإضافية',type:'text',required:false,opts:[]},
     ]},
    {id:3,icon:'📚',iconBg:'#e6f0fb',title:'استطلاع المكتبات الرقمية',desc:'قيّم المكتبة الرقمية في مسجدك',cat:'التعليم',status:'closed',responses:124,
     questions:[
       {text:'هل استخدمت المكتبة الرقمية؟',type:'radio',required:true,opts:['نعم','لا','أعلم لكن لم أستخدمها']},
       {text:'مدى رضاك عن المحتوى المتاح',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','ممتاز']},
     ]},
  ],
  maintenance:{enabled:false,message:'الموقع قيد التطوير — سنعود قريباً',until:''},
  cmsUsers:[],
  surveyResults:{total:847,complete:798,incomplete:49,avgTime:'4.2 دقيقة',sat:88,
    qRes:[
      {text:'مدى الرضا عن جودة الصيانة',opts:['ضعيف','مقبول','جيد','جيد جداً','ممتاز'],counts:[14,52,189,267,325],colors:['#e24b4a','#f97316','#f59e0b','#22c55e','#0f3d26'],insight:'88% إيجابيون — "ممتاز" الأكثر اختياراً بنسبة 38.4%. النتائج السلبية في حدود 1.7%.'},
      {text:'الالتزام بالمواعيد',opts:['لا أبداً','أحياناً','غالباً','دائماً'],counts:[22,89,295,441],colors:['#e24b4a','#f97316','#22c55e','#0f3d26'],insight:'86.9% راضون. 13% تأخر — يُوصى بمراجعة آلية الجدولة وإرسال إشعارات مسبقة.'},
      {text:'التوصية بالجمعية',opts:['لا','ربما','نعم','بكل تأكيد'],counts:[8,31,198,610],colors:['#e24b4a','#f97316','#22c55e','#0f3d26'],insight:'98% يوصون أو يوصون بشدة — مؤشر ثقة استثنائي يعكس رضا المستفيدين.'},
    ]},
  analysisReports:[],
  boardDecisions:[],
  footer:{about:'جمعية العناية بالمساجد جمعية خيرية غير ربحية مرخصة من وزارة الموارد البشرية.',phone:'920001234',email:'info@mosqueksa.org',address:'الرياض، المملكة العربية السعودية',mapUrl:'https://maps.google.com/?q=24.7136,46.6753',mapLabel:'الرياض · حي العليا',
    links:[{label:'الرئيسية',url:'home'},{label:'المشاريع',url:'projects'},{label:'الاستطلاعات',url:'surveys-sec'},{label:'الأخبار',url:'news'},{label:'الوثائق والتقارير',url:'#',page:'docs'},{label:'الشكاوى والمقترحات',url:'#',page:'complaints'},{label:'نماذج التسجيل',url:'#',page:'register'},{label:'تواصل معنا',url:'p-ft-sec'}],
    socials:[{icon:'𝕏',label:'تويتر',url:'#'},{icon:'📷',label:'إنستغرام',url:'#'},{icon:'▶',label:'يوتيوب',url:'#'},{icon:'💬',label:'واتساب',url:'#'},{icon:'✉',label:'بريد',url:'#'}]},
  hiddenSections:new Set(),
  customPages:[],
  customcustomPages:[],
  pages:{
    docs:{
      pdfs:[
        {title:'التقرير السنوي 1445 هـ',desc:'التقرير السنوي الشامل للجمعية',date:'15 مارس 2026',size:'2.4 MB',file:'',fileUrl:'',bg:'#e8f2ec',icon:'📄'},
        {title:'دليل معايير الصيانة',desc:'المعايير التقنية المعتمدة لصيانة المساجد',date:'10 يناير 2026',size:'890 KB',file:'',fileUrl:'',bg:'#fef6e4',icon:'📋'},
        {title:'سياسة جمع التبرعات',desc:'الإطار المرجعي لسياسات جمع التبرعات',date:'5 نوفمبر 2025',size:'450 KB',file:'',fileUrl:'',bg:'#e6f0fb',icon:'📑'},
        {title:'نتائج استطلاع الرضا 2025',desc:'تقرير تفصيلي بنتائج استطلاعات الرأي',date:'20 ديسمبر 2025',size:'1.2 MB',file:'',fileUrl:'',bg:'#f0e8fb',icon:'📊'},
      ]
    },
    complaints:{
      title:'الشكاوى والمقترحات',
      sub:'مساهمتك تساعدنا على التطوير المستمر — نحن نسمعك ونتجاوب',
    },
    register:{
      title:'نماذج التسجيل',
      forms:[
        {label:'عضو جمعية عمومية',icon:'👤',desc:'للانضمام كعضو عمومي والتصويت في الجمعية',fields:[
          {label:'الاسم الكامل الثلاثي',type:'text',required:true},
          {label:'رقم الهوية الوطنية',type:'text',required:true},
          {label:'رقم الهاتف',type:'tel',required:true},
          {label:'البريد الإلكتروني',type:'email',required:false},
          {label:'المنطقة',type:'select',required:true},
          {label:'تاريخ الميلاد',type:'date',required:false},
        ]},
        {label:'متطوع',icon:'🙋',desc:'للتطوع بوقتك ومهاراتك في خدمة المساجد',fields:[
          {label:'الاسم الكامل',type:'text',required:true},
          {label:'العمر',type:'number',required:true},
          {label:'رقم الهاتف',type:'tel',required:true},
          {label:'المهارات والخبرات',type:'select',required:true},
          {label:'السيرة الذاتية',type:'file',required:false},
        ]},
        {label:'متدرب',icon:'🎓',desc:'لبرنامج التدريب الصيفي والتعاوني',fields:[
          {label:'الاسم الكامل',type:'text',required:true},
          {label:'الجامعة',type:'text',required:true},
          {label:'التخصص',type:'text',required:true},
          {label:'رقم الهاتف',type:'tel',required:true},
          {label:'فترة التدريب',type:'select',required:true},
          {label:'خطاب الجامعة',type:'file',required:false},
        ]},
      ]
    },
  },
};
