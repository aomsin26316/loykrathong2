
    /* ========================================================
       1. GLOBAL CONFIGURATION & STATE
       ======================================================== */
    const DEFAULT_CONFIG = {
      collegeName: "วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์",
      year: "๒๕๖๗",
      adminPassword: "1234",
      gasUrl: "", // Put Web App URL here or leave blank for LocalStorage fallback
      departments: [
        "ช่างเทคโนโลยีคอมพิวเตอร์",
        "ช่างยนต์",
        "ช่างไฟฟ้ากำลัง",
        "ช่างอิเล็กทรอนิกส์",
        "ช่างกลโรงงาน",
        "ช่างเชื่อมโลหะ",
        "ช่างก่อสร้าง",
        "การบัญชี",
        "การตลาด",
        "คอมพิวเตอร์ธุรกิจ"
      ]
    };

    let appConfig = JSON.parse(localStorage.getItem('loyKrathongConfig')) || DEFAULT_CONFIG;

    // Current page tracking (0 = River, 1 = Esiimsi, 2 = Ramwong)
    let currentPageIndex = 0;
    const totalPages = 3;

    // Items list (Stored locally and synced with GAS)
    let itemsDatabase = JSON.parse(localStorage.getItem('loyKrathongItems')) || [];

    // Counters
    let cheerGarlandCount = parseInt(localStorage.getItem('cheerGarlands') || '18');
    let cheerClapCount = parseInt(localStorage.getItem('cheerClaps') || '42');

    // DIY Form State
    let currentDiyType = 'krathong'; // 'krathong' | 'lantern'
    let selectedAvatarIndex = 0;
    let uploadedPhotoBase64 = null; // resized base64 dataURL

    // Preset Wishes categorized
    const PRESET_WISHES = {
      khoma: [
        "ข้าพเจ้าขอขมาพระแม่คงคา ที่ได้ทิ้งสิ่งปฏิกูลลงสู่สายน้ำ ขอโปรดอภัยและประทานความร่มเย็น",
        "ขอขมาแม่คงคาด้วยกระทงนี้ ขอชำระล้างสิ่งไม่ดีและเคราะห์ร้ายให้ลอยลับไปกับสายน้ำ",
        "กราบขอขมาพระแม่คงคา ขอให้ชีวิตราบรื่น มีแต่ความสุขกายสบายใจตลอดทั้งปี"
      ],
      study: [
        "ขอให้โปรเจกต์คอมพิวเตอร์ผ่านฉลุย โค้ดไร้บั๊ก อาจารย์ตรวจรอบเดียวผ่าน!",
        "ขอให้สอบเทอมนี้เกรด 4.00 ทุกรายวิชา ไม่ติด 0 ไม่ติด ร ไม่ติด มส.",
        "ขอให้ฝึกงานอย่างราบรื่น ได้ประสบการณ์ดีๆ มีงานรองรับเงินเดือนสูงๆ"
      ],
      love: [
        "ลอยกระทงปีนี้ ขอให้ได้เจอคนรู้ใจที่ท่าน้ำวิทยาลัย หรือขอให้รักกับคนปัจจุบันยืนยาว",
        "กระทงหลงทางยังพอหาเจอ แต่ถ้าหลงเธอแล้วจะหาทางออกยังไง ขอให้สมหวังในรัก!",
        "ลอยกระทงคนเดียวปีสุดท้าย ปีหน้าขอให้มีคนมาเดินจับมือลอยกระทงด้วยกันนะ"
      ],
      health: [
        "ขอให้ครอบครัวและคนที่รักทุกคนมีสุขภาพร่างกายแข็งแรง ปราศจากโรคภัยไข้เจ็บ",
        "ขอให้ปีนี้มีแต่ความโชคดี เงินทองไหลมาเทมา มีรอยยิ้มในทุกๆ วัน",
        "ขอให้ชีวิตสงบสุข มีสติปัญญาแจ่มใส ปลอดภัยจากอันตรายทั้งปวง"
      ]
    };

    // 20 Vocational Student Esiimsi Fortunes
    const ESIIMSI_FORTUNES = [
      {
        num: 1,
        title: "ใบที่ ๑: เบญจมงคลเริ่มต้นใหม่",
        poem: "สายน้ำไหลหลั่งนำพาสิ่งดี เริ่มต้นสิ่งใดสำเร็จสมฤทัย",
        study: "อ่านหนังสือจุดไหน ออกสอบจุดนั้น เกรดพุ่ง",
        love: "คนโสดมีแววพบรักรุ่นพี่หรือเพื่อนร่วมแผนก",
        luck: "มีลาภจากการจับฉลากหรือของฝากเพื่อน"
      },
      {
        num: 2,
        title: "ใบที่ ๒: ความเพียรย่อมชนะ",
        poem: "งานหนักไม่เคยฆ่าใคร ขยันเข้าไว้ความสำเร็จรออยู่",
        study: "ส่งงานอาจารย์ครบตามนัด ได้คะแนนเก็บเต็ม",
        love: "อย่าเพิ่งใจร้อน ค่อยๆ ศึกษาดูใจกันไปก่อน",
        luck: "โชคลาภปานกลาง ให้ระวังทำปากกาคู่ใจหล่นหาย"
      },
      {
        num: 3,
        title: "ใบที่ ๓: ฟ้าหลังฝนงดงาม",
        poem: "ปัญหาที่ติดขัดจะคลี่คลาย ผู้ใหญ่เมตตาช่วยเหลือ",
        study: "วิชาคำนวณที่ว่ายาก จะเข้าใจและสอบผ่าน",
        love: "คนที่เข้าใจผิดจะกลับมาคุยกันดีเหมือนเดิม",
        luck: "มีคนเลี้ยงชานมไข่มุกหรือของกินอร่อย"
      },
      {
        num: 4,
        title: "ใบที่ ๔: มิตรแท้ร่วมสู้",
        poem: "เพื่อนดีพาเจริญ จับมือร่วมสร้างผลงาน",
        study: "จับกลุ่มทำโปรเจกต์ราบรื่น เพื่อนช่วยกันคนละไม้ละมือ",
        love: "เพื่อนสนิทอาจคิดเกินเพื่อน สังเกตสายตาดูดีๆ",
        luck: "เลขห้องเรียนหรือรหัสวิชาอาจนำโชคดีมาให้"
      },
      {
        num: 5,
        title: "ใบที่ ๕: บารมีช่างกลหนุนนำ",
        poem: "ฝีมือแม่นยำดั่งจับวาง สมาธิดีไม่มีพลาด",
        study: "สอบภาคปฏิบัติคะแนนท็อป อาจารย์เอ่ยปากชม",
        love: "เสน่ห์แรง มีคนแอบมองตอนเข้าช็อปปฏิบัติงาน",
        luck: "ได้รับข่าวดีเรื่องเงินกู้ กยศ. หรือทุนการศึกษา"
      },
      {
        num: 6,
        title: "ใบที่ ๖: ดวงรักผลิบานริมน้ำ",
        poem: "คืนเพ็ญเดือนสิบสอง หัวใจมีผู้จับจอง",
        study: "การเรียนเรื่อยๆ ไม่หวือหวาแต่ปลอดภัย",
        love: "คนที่แอบส่งสติ๊กเกอร์ให้ มีใจตรงกันแน่นอน",
        luck: "ลาภลอยจากการเดินทางท่องเที่ยว"
      },
      {
        num: 7,
        title: "ใบที่ ๗: โค้ดผ่านฉลุย ไร้บั๊ก",
        poem: "นิ้วสัมผัสคีย์บอร์ด พลังสมองแล่นปรื๊ด",
        study: "เขียนโปรแกรมคอมไพล์รอบเดียวผ่าน ไม่มี Error กวนใจ",
        love: "ความสัมพันธ์นิ่งสนิทเหมือนเซิร์ฟเวอร์เสถียร",
        luck: "ได้อุปกรณ์ไอทีใหม่ หรือสายชาร์จไม่พังง่าย"
      },
      {
        num: 8,
        title: "ใบที่ ๘: สายชิลล์แต่เอาอยู่",
        poem: "อย่ากังวลจนเกินเหตุ วางแผนให้ดีทุกอย่างผ่านได้",
        study: "ติวหนังสือคืนเดียวแต่จำแม่น สอบผ่านสบาย",
        love: "มีคนคุยแก้เหงา แต่อย่าเพิ่งรีบเปิดตัว",
        luck: "เดินไปไหนก็เจอที่จอดรถมอเตอร์ไซค์ว่าง"
      },
      {
        num: 9,
        title: "ใบที่ ๙: เกรดสี่อยู่ไม่ไกล",
        poem: "ดาวรุ่งพุ่งแรง อนาคตสดใสเกินใคร",
        study: "ผลการเรียนเทอมนี้มีสิทธิ์ได้เกียรตินิยม",
        love: "คนรักคอยซัพพอร์ต ช่วยกันติวช่วยกันเรียน",
        luck: "มีโชคทางการเงิน ได้เงินคืนจากเพื่อนที่ยืมไป"
      },
      {
        num: 10,
        title: "ใบที่ ๑๐: ระวังงานด่วนงานงอก",
        poem: "อย่าดองงานไว้วันสุดท้าย จะกลายเป็นดินพอกหางหมู",
        study: "รีบเคลียร์ใบงานและสมุดการบ้านก่อนจะส่งไม่ทัน",
        love: "ระวังเรื่องหึงหวงโดยใช่เหตุ เปิดใจคุยกัน",
        luck: "งดเสี่ยงโชคช่วงนี้ เน้นประหยัดเก็บออมไว้กินของอร่อย"
      },
      {
        num: 11,
        title: "ใบที่ ๑๑: ดวงเสน่ห์จับใจ",
        poem: "หน้าตาผ่องใส ใครเห็นใครก็รักและเอ็นดู",
        study: "อาจารย์ให้คะแนนจิตพิสัยเต็มร้อย",
        love: "มีรุ่นน้องต่างแผนกทักแชตมาคุยแก้เหงา",
        luck: "ได้ของแถมเวลาไปซื้อข้าวโรงอาหาร"
      },
      {
        num: 12,
        title: "ใบที่ ๑๒: ไฟฟ้าสว่างไสว",
        poem: "ประกายไฟแห่งปัญญา ส่องสว่างทางข้างหน้า",
        study: "ไอเดียทำโครงงานสิ่งประดิษฐ์ได้รับเลือกไปแข่ง",
        love: "หัวใจเต้นแรงเหมือนไฟช็อตเมื่อสบตากับคนน่ารัก",
        luck: "มีดวงได้รับรางวัลจากการร่วมกิจกรรมวิทยาลัย"
      },
      {
        num: 13,
        title: "ใบที่ ๑๓: สุขภาพแข็งแรง",
        poem: "ร่างกายแข็งแกร่ง พลังกายพร้อมลุยทุกสถานการณ์",
        study: "เรียนหนักแต่ไม่ง่วง เข้าแถวทันเพลงชาติตลอด",
        love: "ความรักสดชื่น สบายใจเหมือนได้กินน้ำเก๊กฮวยเย็นๆ",
        luck: "แคล้วคลาดปลอดภัยทุกการเดินทาง"
      },
      {
        num: 14,
        title: "ใบที่ ๑๔: พบคู่แท้ท่าน้ำท่าหลวง",
        poem: "โชคชะตาพามาพบ ณ ท่าน้ำริมสายชล",
        study: "มีคนช่วยถือของ ช่วยจดเลกเชอร์ให้",
        love: "มีเกณฑ์พบคนรู้ใจที่มีรสนิยมคล้ายกันในงานเทศกาล",
        luck: "โชคดีสองเด้ง ทั้งเรื่องเพื่อนและครอบครัว"
      },
      {
        num: 15,
        title: "ใบที่ ๑๕: นักสร้างสรรค์มือทอง",
        poem: "หยิบจับทำสิ่งใดก็งดงาม ปราณีตไร้ที่ติ",
        study: "ชิ้นงานส่งประกวดได้ขึ้นบอร์ดหน้าแผนก",
        love: "คนรักประทับใจในความใส่ใจดูแล",
        luck: "มีลาภปาก ได้กินหมูกระทะฟรีมีคนเลี้ยง"
      },
      {
        num: 16,
        title: "ใบที่ ๑๖: บุญกุศลหนุนชะตา",
        poem: "ปล่อยทุกข์ลอยไปตามน้ำ รับสิ่งมงคลเข้าสู่ชีวิต",
        study: "ปัญหาความขัดแย้งในห้องเรียนยุติด้วยดี",
        love: "เข้าใจซึ่งกันและกันมากขึ้น",
        luck: "พบเจอสิ่งของที่เคยทำหล่นหายไปนาน"
      },
      {
        num: 17,
        title: "ใบที่ ๑๗: ดวงผู้นำโดดเด่น",
        poem: "พูดจามีน้ำหนัก เพื่อนพ้องให้ความเคารพ",
        study: "ได้รับเลือกเป็นหัวหน้ากลุ่มหรือตัวแทนห้อง",
        love: "เป็นที่พึ่งพาให้คนที่ชอบได้ดีมาก",
        luck: "การเจรจาต่อรองเรื่องเงินหรืองานสำเร็จลุล่วง"
      },
      {
        num: 18,
        title: "ใบที่ ๑๘: ก้าวกระโดดสู่อนาคต",
        poem: "ฝึกปรือฝีมือวันนี้ พรุ่งนี้คือนายช่างผู้ชำนาญ",
        study: "ทักษะวิชาชีพก้าวหน้าเร็วกว่าเพื่อนร่วมรุ่น",
        love: "มีคนแอบส่งกำลังใจให้เงียบๆ ไม่เปิดเผยตัว",
        luck: "มีโชคเกี่ยวกับตัวเลขทะเบียนรถหรือเลขห้อง"
      },
      {
        num: 19,
        title: "ใบที่ ๑๙: รอยยิ้มพิมพ์ใจ",
        poem: "มองโลกในแง่ดี ชีวีมีแต่ความสุขสำราญ",
        study: "บรรยากาศการเรียนสนุกสนาน ไม่เครียด",
        love: "คนรักชวนไปเที่ยวงานวัด หาของกินอร่อยๆ ร่วมกัน",
        luck: "สุ่มได้ของรางวัลชิ้นใหญ่ในงานรื่นเริง"
      },
      {
        num: 20,
        title: "ใบที่ ๒๐: มหาลาภศิษย์ท่าหลวง",
        poem: "เกียรติภูมิวิทยาลัยนำพา ความเจริญก้าวหน้าสู่ตน",
        study: "สำเร็จการศึกษาด้วยความภาคภูมิใจ มีงานทำทันที",
        love: "รักลงตัว มีความสุขกับชีวิตปัจจุบัน",
        luck: "ดวงการเงินดีเด่น มีรายได้พิเศษเข้ามาไม่ขาดสาย"
      }
    ];

    /* ========================================================
       2. SVG AVATARS GENERATION
       ======================================================== */
    const AVATARS_SVG = [
      // 0: Boy student glasses
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#FDE68A"/>
        <circle cx="40" cy="44" r="24" fill="#FED7AA"/>
        <!-- Hair -->
        <path d="M18,36 C18,20 32,14 40,14 C48,14 62,20 62,36 C55,26 48,24 40,24 C32,24 25,26 18,36 Z" fill="#1E293B"/>
        <!-- Glasses -->
        <circle cx="32" cy="42" r="7" fill="none" stroke="#0F172A" stroke-width="2.5"/>
        <circle cx="48" cy="42" r="7" fill="none" stroke="#0F172A" stroke-width="2.5"/>
        <line x1="39" y1="42" x2="41" y2="42" stroke="#0F172A" stroke-width="2.5"/>
        <circle cx="32" cy="42" r="2.5" fill="#0F172A"/>
        <circle cx="48" cy="42" r="2.5" fill="#0F172A"/>
        <!-- Smile -->
        <path d="M34,54 Q40,60 46,54" stroke="#DC2626" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="24" cy="48" r="4" fill="#F87171" opacity="0.5"/>
        <circle cx="56" cy="48" r="4" fill="#F87171" opacity="0.5"/>
      </svg>`,
      // 1: Girl student ribbon
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#FBCFE8"/>
        <circle cx="40" cy="44" r="24" fill="#FED7AA"/>
        <!-- Hair -->
        <path d="M16,42 C16,18 64,18 64,42 C56,26 48,22 40,22 C32,22 24,26 16,42 Z" fill="#471407"/>
        <path d="M16,40 Q12,58 20,62 M64,40 Q68,58 60,62" stroke="#471407" stroke-width="6" stroke-linecap="round"/>
        <!-- Ribbon -->
        <circle cx="22" cy="22" r="6" fill="#EC4899"/>
        <!-- Eyes -->
        <circle cx="33" cy="42" r="3" fill="#0F172A"/>
        <circle cx="47" cy="42" r="3" fill="#0F172A"/>
        <circle cx="34" cy="40.5" r="1" fill="#FFFFFF"/>
        <circle cx="48" cy="40.5" r="1" fill="#FFFFFF"/>
        <!-- Smile -->
        <path d="M35,53 Q40,58 45,53" stroke="#DB2777" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="26" cy="47" r="4" fill="#FB7185" opacity="0.6"/>
        <circle cx="54" cy="47" r="4" fill="#FB7185" opacity="0.6"/>
      </svg>`,
      // 2: Vocational Mechanic boy with headband
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#BAE6FD"/>
        <circle cx="40" cy="44" r="24" fill="#FDBA74"/>
        <!-- Spiky Hair -->
        <polygon points="20,32 30,12 40,24 50,12 60,32" fill="#1E1B4B"/>
        <!-- Headband -->
        <rect x="18" y="28" width="44" height="7" rx="3" fill="#EF4444"/>
        <!-- Eyes -->
        <circle cx="33" cy="44" r="3" fill="#0F172A"/>
        <circle cx="47" cy="44" r="3" fill="#0F172A"/>
        <!-- Cool smile -->
        <path d="M35,54 Q42,57 47,52" stroke="#991B1B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Wrench icon sticker on face -->
        <circle cx="25" cy="48" r="3.5" fill="#38BDF8" opacity="0.5"/>
      </svg>`,
      // 3: Smart Computer Tech Girl with headset
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#DDD6FE"/>
        <circle cx="40" cy="44" r="24" fill="#FED7AA"/>
        <!-- Short Bob Hair -->
        <path d="M18,36 C18,20 62,20 62,36 L64,52 L56,50 L56,34 L24,34 L24,50 L16,52 Z" fill="#312E81"/>
        <!-- Headset -->
        <path d="M16,40 Q40,16 64,40" stroke="#10B981" stroke-width="3" fill="none"/>
        <rect x="14" y="38" width="6" height="12" rx="3" fill="#10B981"/>
        <rect x="60" y="38" width="6" height="12" rx="3" fill="#10B981"/>
        <!-- Eyes -->
        <circle cx="33" cy="43" r="3" fill="#0F172A"/>
        <circle cx="47" cy="43" r="3" fill="#0F172A"/>
        <!-- Smile -->
        <path d="M35,53 Q40,58 45,53" stroke="#4F46E5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`,
      // 4: Cute Thai Costume Boy (Traditional Chon Kben)
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#FEF08A"/>
        <circle cx="40" cy="44" r="24" fill="#FED7AA"/>
        <!-- Topknot hair with gold ring -->
        <ellipse cx="40" cy="18" rx="8" ry="7" fill="#1C1917"/>
        <ellipse cx="40" cy="23" rx="10" ry="3" fill="#F59E0B"/>
        <!-- Hair fringe -->
        <path d="M22,34 Q40,24 58,34" stroke="#1C1917" stroke-width="4" fill="none"/>
        <!-- Eyes -->
        <circle cx="33" cy="43" r="3" fill="#0F172A"/>
        <circle cx="47" cy="43" r="3" fill="#0F172A"/>
        <circle cx="34" cy="41.5" r="1" fill="#FFFFFF"/>
        <circle cx="48" cy="41.5" r="1" fill="#FFFFFF"/>
        <!-- Smile -->
        <path d="M35,53 Q40,59 45,53" stroke="#B45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="24" cy="48" r="4" fill="#F472B6" opacity="0.6"/>
        <circle cx="56" cy="48" r="4" fill="#F472B6" opacity="0.6"/>
      </svg>`,
      // 5: Cute Thai Chut Thai Girl with Jasmine Garland
      `<svg viewBox="0 0 80 80" class="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="#BBF7D0"/>
        <circle cx="40" cy="44" r="24" fill="#FED7AA"/>
        <!-- Sleek Hair bun on side with flower -->
        <circle cx="54" cy="26" r="10" fill="#18181B"/>
        <circle cx="54" cy="26" r="5" fill="#FDE047"/>
        <path d="M20,38 C20,22 56,22 56,38" fill="#18181B"/>
        <!-- Eyes -->
        <circle cx="32" cy="43" r="3" fill="#0F172A"/>
        <circle cx="46" cy="43" r="3" fill="#0F172A"/>
        <!-- Dimple Smile -->
        <path d="M34,53 Q39,58 44,53" stroke="#BE185D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Cheeks -->
        <circle cx="24" cy="48" r="4" fill="#FB7185" opacity="0.6"/>
        <circle cx="52" cy="48" r="4" fill="#FB7185" opacity="0.6"/>
      </svg>`
    ];

    /* ========================================================
       3. WEB AUDIO API SYNTHESIZER (No external audio needed!)
       ======================================================== */
    let audioCtx = null;
    let isBgmPlaying = false;
    let bgmIntervalId = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    // Bamboo Cup Shake Sound Generator (Web Audio white noise bursts)
    function playBambooShakeSound() {
      try {
        const ctx = getAudioContext();
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
              data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter to simulate hollow bamboo resonance
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 1400 + (Math.random() * 600 - 300);
            filter.Q.value = 4.0;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
          }, i * 70);
        }
      } catch (e) {
        console.warn("Audio not supported or blocked", e);
      }
    }

    // Stick drop sound
    function playStickDropSound() {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } catch (e) {}
    }

    // Fireworks celebratory sound
    function playFireworksSound() {
      try {
        const ctx = getAudioContext();
        // Sub-bass boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);

        // Crackle sparkles
        setTimeout(() => {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const bSize = ctx.sampleRate * 0.04;
              const buf = ctx.createBuffer(1, bSize, ctx.sampleRate);
              const d = buf.getChannelData(0);
              for (let j = 0; j < bSize; j++) d[j] = Math.random() * 2 - 1;
              const n = ctx.createBufferSource();
              n.buffer = buf;
              const g = ctx.createGain();
              g.gain.setValueAtTime(0.2, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
              n.connect(g);
              g.connect(ctx.destination);
              n.start();
            }, i * 45);
          }
        }, 100);
      } catch (e) {}
    }

    // Thai Traditional Ramwong Melody Synthesizer (Pentatonic scale: F, G, A, C, D)
    const RAMWONG_NOTES = [
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      880.00  // A5
    ];
    // Traditional Loy Krathong motif rhythm sequence
    const MELODY_SEQUENCE = [
      3, 3, 2, 1,  3, 4, 3, 2,  1, 2, 3, 1,  2, 0, 1, 2,
      3, 4, 5, 4,  3, 2, 3, 1,  2, 3, 4, 3,  2, 1, 0, 1
    ];
    let melodyStep = 0;

    function playSynthNote(freq, duration = 0.22, type = 'sine') {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft bell/marimba like envelope
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
      } catch (e) {}
    }

    // Drum beat (Ching & Glong Ramwong)
    function playRamwongPercussion(beat) {
      try {
        const ctx = getAudioContext();
        if (beat % 2 === 0) {
          // Glong (Bass tom)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.13);
        } else {
          // Ching (High chime)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1480, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.26);
        }
      } catch (e) {}
    }

    function toggleBGM() {
      const btn = document.getElementById('bgmToggleBtn');
      const icon = document.getElementById('bgmIcon');
      if (isBgmPlaying) {
        clearInterval(bgmIntervalId);
        isBgmPlaying = false;
        icon.className = 'fa-solid fa-volume-xmark';
        btn.classList.remove('bg-amber-500', 'text-slate-950');
        btn.classList.add('text-amber-400');
        showToast("ปิดเสียงเพลงบรรเลงแล้ว", "info");
      } else {
        getAudioContext();
        isBgmPlaying = true;
        icon.className = 'fa-solid fa-music animate-bounce';
        btn.classList.add('bg-amber-500', 'text-slate-950');
        btn.classList.remove('text-amber-400');
        showToast("กำลังเล่นดนตรีไทยบรรเลงรำวง", "success");

        bgmIntervalId = setInterval(() => {
          const noteIndex = MELODY_SEQUENCE[melodyStep % MELODY_SEQUENCE.length];
          const freq = RAMWONG_NOTES[noteIndex];
          playSynthNote(freq, 0.25, 'triangle');
          playRamwongPercussion(melodyStep);
          melodyStep++;
        }, 280);
      }
    }

    /* ========================================================
       4. SWIPEABLE NAVIGATION (TOUCH & DESKTOP)
       ======================================================== */
    const swipeContainer = document.getElementById('swipeContainer');
    let touchStartX = 0;
    let touchEndX = 0;

    function switchPage(index) {
      if (index < 0 || index >= totalPages) return;
      currentPageIndex = index;
      swipeContainer.style.transform = `translateX(-${index * (100 / totalPages)}%)`;

      // Update Header Tab state
      for (let i = 0; i < totalPages; i++) {
        const tabBtn = document.getElementById(`tab-btn-${i}`);
        const mobBtn = document.getElementById(`mob-btn-${i}`);
        if (i === index) {
          if (tabBtn) {
            tabBtn.className = "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30";
          }
          if (mobBtn) {
            mobBtn.className = "flex flex-col items-center text-amber-400 font-bold";
          }
        } else {
          if (tabBtn) {
            tabBtn.className = "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 text-slate-300 hover:text-amber-300";
          }
          if (mobBtn) {
            mobBtn.className = "flex flex-col items-center text-slate-400";
          }
        }
      }

      // If switching to stage, re-trigger dancer render
      if (index === 2) {
        renderStageDancers();
      }
    }

    function prevPage() {
      if (currentPageIndex > 0) switchPage(currentPageIndex - 1);
    }
    function nextPage() {
      if (currentPageIndex < totalPages - 1) switchPage(currentPageIndex + 1);
    }

    // Touch Swipe Event Listeners
    const swipeViewport = document.getElementById('swipeViewport');
    swipeViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    swipeViewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });

    function handleGesture() {
      const deltaX = touchEndX - touchStartX;
      const minSwipeDistance = 50;
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX < 0) {
          nextPage(); // Swiped left -> Next page
        } else {
          prevPage(); // Swiped right -> Previous page
        }
      }
    }

    /* ========================================================
       5. RIVER CANVAS & PARTICLES (PAGE 1)
       ======================================================== */
    const riverCanvas = document.getElementById('riverCanvas');
    const ctxRiver = riverCanvas.getContext('2d');
    let canvasWidth, canvasHeight;
    let waterRipples = [];
    let skyStars = [];

    function initCanvasDimensions() {
      const p0 = document.getElementById('page-0');
      canvasWidth = riverCanvas.width = p0.clientWidth;
      canvasHeight = riverCanvas.height = p0.clientHeight;

      // Init Stars
      skyStars = [];
      for (let i = 0; i < 60; i++) {
        skyStars.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * (canvasHeight * 0.55),
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.01
        });
      }

      // Init Ripples
      waterRipples = [];
      for (let i = 0; i < 15; i++) {
        waterRipples.push({
          x: Math.random() * canvasWidth,
          y: canvasHeight * 0.65 + Math.random() * (canvasHeight * 0.35),
          w: Math.random() * 40 + 20,
          speed: Math.random() * 0.6 + 0.3,
          alpha: Math.random() * 0.4 + 0.2
        });
      }
    }

    function animateRiverCanvas() {
      ctxRiver.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw Twinkling Stars
      for (let s of skyStars) {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
        ctxRiver.beginPath();
        ctxRiver.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctxRiver.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.alpha)})`;
        ctxRiver.fill();
      }

      // Draw Water Light Ripples
      for (let r of waterRipples) {
        r.x -= r.speed;
        if (r.x < -r.w) {
          r.x = canvasWidth + r.w;
          r.y = canvasHeight * 0.65 + Math.random() * (canvasHeight * 0.35);
        }
        ctxRiver.beginPath();
        ctxRiver.ellipse(r.x, r.y, r.w, 2, 0, 0, Math.PI * 2);
        ctxRiver.fillStyle = `rgba(245, 158, 11, ${r.alpha * 0.25})`;
        ctxRiver.fill();
      }

      requestAnimationFrame(animateRiverCanvas);
    }

    function changeRiverScene(theme) {
      const backdropSky = document.getElementById('backdropSky');
      const scenery = document.getElementById('backdropScenery');
      const fullMoon = document.getElementById('fullMoon');

      if (theme === 'campus') {
        backdropSky.className = "absolute inset-0 bg-gradient-to-b from-[#1E1B4B] via-[#1E3A8A] via-[#1D4ED8]/45 to-[#0284C7]/85";
        scenery.style.opacity = '0.8';
        fullMoon.style.display = 'block';
      } else if (theme === 'moon') {
        backdropSky.className = "absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] via-[#1E3A8A]/80 to-[#0284C7]";
        scenery.style.opacity = '0.5';
        fullMoon.style.display = 'block';
        fullMoon.style.transform = 'scale(1.25)';
      } else if (theme === 'temple') {
        backdropSky.className = "absolute inset-0 bg-gradient-to-b from-[#581C87] via-[#7E22CE] via-[#2563EB]/50 to-[#0284C7]/90";
        scenery.style.opacity = '0.95';
        fullMoon.style.display = 'block';
      }
      showToast(`เปลี่ยนฉากเป็น: ${document.querySelector(`#bgThemeSelect option[value="${theme}"]`).textContent}`, 'info');
    }

    /* ========================================================
       BOT KRATHONGS & LANTERNS DATA (BACKGROUND PARTICIPANTS)
       ======================================================== */
    const BOT_ITEMS = [
      {
        id: 'BOT_1',
        type: 'krathong',
        fullName: 'อ.พงษ์ศักดิ์ (หน.แผนกคอมฯ)',
        department: 'เทคโนโลยีคอมพิวเตอร์',
        isBot: true,
        avatar: 0,
        wish: 'ขอให้ลูกศิษย์ทุกคนเกรด 4.00 ได้งานทำเงินเดือนสูงๆ ทุกคน!',
        likes: 68,
        designConfig: { base: 'lotus', flowers: 'marigold', candle: 'gold', frameStyle: 'flower' }
      },
      {
        id: 'BOT_2',
        type: 'krathong',
        fullName: 'พี่เบิร์ด ช่างยนต์ 67',
        department: 'ช่างยนต์',
        isBot: true,
        avatar: 2,
        wish: 'ขอให้เครื่องยนต์แรง ซ่อมรอบเดียวจบ ไม่มีสะดุด ปลอดภัยทุกทริป!',
        likes: 42,
        designConfig: { base: 'banana', flowers: 'orchid', candle: 'red', frameStyle: 'circle' }
      },
      {
        id: 'BOT_3',
        type: 'lantern',
        fullName: 'น้องฟ้าใส (ปี 1 คอมฯ)',
        department: 'เทคโนโลยีคอมพิวเตอร์',
        isBot: true,
        avatar: 1,
        wish: 'ขอให้โค้ดรันผ่านฉลุย โปรเจกต์ผ่านรอบเดียวไม่มีบั๊กกวนใจ!',
        likes: 54,
        designConfig: { shape: 'traditional', color: '#EC4899', frameStyle: 'heart' }
      },
      {
        id: 'BOT_4',
        type: 'krathong',
        fullName: 'ช่างไฟพลังช้าง',
        department: 'ช่างไฟฟ้ากำลัง',
        isBot: true,
        avatar: 4,
        wish: 'ขอให้ต่อวงจรผ่านฉลุย ไฟไม่ตัด ไม่ช็อต แคล้วคลาดปลอดภัย!',
        likes: 35,
        designConfig: { base: 'banana', flowers: 'jasmine', candle: 'gold', frameStyle: 'circle' }
      },
      {
        id: 'BOT_5',
        type: 'lantern',
        fullName: 'น้องเนย การบัญชี',
        department: 'การบัญชี',
        isBot: true,
        avatar: 3,
        wish: 'ขอให้เดบิต เครดิต งบดุลลงตัวเป๊ะ ปิดยอดได้ทุกสิ้นเดือน!',
        likes: 49,
        designConfig: { shape: 'oval', color: '#FBBF24', frameStyle: 'heart' }
      },
      {
        id: 'BOT_6',
        type: 'krathong',
        fullName: 'ทีมหุ่นยนต์กู้ภัย ท.ล.',
        department: 'ช่างอิเล็กทรอนิกส์',
        isBot: true,
        avatar: 2,
        wish: 'ขอให้คว้าแชมป์การแข่งขันทักษะวิชาชีพ นำชื่อเสียงสู่วิทยาลัยเทคนิคท่าหลวงฯ',
        likes: 88,
        designConfig: { base: 'ice', flowers: 'marigold', candle: 'red', frameStyle: 'flower' }
      },
      {
        id: 'BOT_7',
        type: 'krathong',
        fullName: 'ช่างกลโรงงาน รุ่นเก๋า',
        department: 'ช่างกลโรงงาน',
        isBot: true,
        avatar: 4,
        wish: 'ขอให้งานกลึงมิลลิ่งเป๊ะตามแบบ ไม่เกินพิกัดความเผื่อ งานเนียนกริ๊บ!',
        likes: 31,
        designConfig: { base: 'bread', flowers: 'mixed', candle: 'gold', frameStyle: 'circle' }
      },
      {
        id: 'BOT_8',
        type: 'lantern',
        fullName: 'สาวมั่นการตลาด',
        department: 'การตลาด',
        isBot: true,
        avatar: 5,
        wish: 'ขอให้ยอดขายปังๆ ลูกค้าทักแชตไม่หยุด ประสบความสำเร็จในชีวิต!',
        likes: 39,
        designConfig: { shape: 'star', color: '#A855F7', frameStyle: 'circle' }
      },
      {
        id: 'BOT_9',
        type: 'krathong',
        fullName: 'นายช่างเชื่อมสายเท่',
        department: 'ช่างเชื่อมโลหะ',
        isBot: true,
        avatar: 2,
        wish: 'รอยเชื่อมเกล็ดปลาเนียนกริ๊บ ตรวจสอบรอยร้าว X-ray ผ่านฉลุย 100%',
        likes: 27,
        designConfig: { base: 'banana', flowers: 'marigold', candle: 'red', frameStyle: 'circle' }
      },
      {
        id: 'BOT_10',
        type: 'lantern',
        fullName: 'น้องมุก คอมธุรกิจ',
        department: 'คอมพิวเตอร์ธุรกิจ',
        isBot: true,
        avatar: 1,
        wish: 'ลอยกระทงปีนี้ ขอให้ได้พบคนรู้ใจที่ท่าน้ำวิทยาลัยด้วยเถิดดด!',
        likes: 63,
        designConfig: { shape: 'traditional', color: '#38BDF8', frameStyle: 'heart' }
      }
    ];

    /* ========================================================
       6. FLOATING ITEMS RENDERER & INTERACTION (PAGE 1)
       ======================================================== */
    const floatingRiverItemsContainer = document.getElementById('floatingRiverItems');

    function renderFloatingItems(newlyLaunchedId = null) {
      floatingRiverItemsContainer.innerHTML = '';

      // --- LAYER 1: Background Bot Krathongs & Lanterns ---
      BOT_ITEMS.forEach((bot, bIndex) => {
        const isKrathong = bot.type === 'krathong';
        const botElem = document.createElement('div');
        botElem.className = 'absolute cursor-pointer pointer-events-auto transform transition-transform hover:scale-110 active:scale-95 group z-10 opacity-85';

        if (isKrathong) {
          // River background depth: bottom 105px to 165px
          const bottomPos = 105 + (bIndex * 24) % 65;
          botElem.style.bottom = `${bottomPos}px`;
          botElem.style.top = 'auto';
          const duration = 22 + (bIndex % 3) * 4;
          const delay = -(((bIndex * 5.8) + 1.5) % duration);
          botElem.style.animation = `driftRiver ${duration}s linear ${delay}s infinite`;
        } else {
          // Sky background depth: top 6% to 32%
          const topPos = 6 + (bIndex * 15) % 28;
          botElem.style.top = `${topPos}%`;
          botElem.style.bottom = 'auto';
          const duration = 28 + (bIndex % 3) * 5;
          const delay = -(((bIndex * 6.5) + 2) % duration);
          botElem.style.animation = `driftSkyLantern ${duration}s linear ${delay}s infinite`;
        }

        botElem.style.left = '0px';

        const frameClass = bot.designConfig?.frameStyle === 'heart' 
          ? 'rounded-full border border-pink-400' 
          : 'rounded-full border border-amber-400';

        botElem.innerHTML = `
          <div class="relative flex flex-col items-center transform scale-[0.82]">
            <!-- Bot Wish Speech Bubble -->
            <div class="mb-1 bg-slate-900/85 text-amber-200 text-[9px] px-2 py-0.5 rounded-full border border-amber-500/30 max-w-[115px] truncate opacity-90 group-hover:opacity-100 shadow">
              ${escapeHtml(bot.wish)}
            </div>

            <!-- Avatar -->
            <div class="relative -mb-2 z-10 w-8 h-8 ${frameClass} bg-slate-800 shadow-md overflow-hidden flex items-center justify-center">
              ${AVATARS_SVG[bot.avatar || 0]}
            </div>

            <!-- Base Artwork -->
            ${isKrathong ? getKrathongArtworkSVG(bot.designConfig) : getLanternArtworkSVG(bot.designConfig)}

            <!-- Bot Badge Name (Background Ambient) -->
            <div class="mt-0.5 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40 shadow flex items-center space-x-1 max-w-[120px] truncate">
              <span class="text-[10px]">🤖</span>
              <span>${escapeHtml(bot.fullName)}</span>
            </div>
            <div class="text-[8px] text-pink-300/80 font-medium">${escapeHtml(bot.department)}</div>
          </div>
        `;

        botElem.onclick = (e) => {
          e.stopPropagation();
          openDetailModal(bot);
        };

        floatingRiverItemsContainer.appendChild(botElem);
      });

      // --- LAYER 2: Foreground User Krathongs & Lanterns ---
      itemsDatabase.slice(0, 20).forEach((item, index) => {
        const itemElem = document.createElement('div');
        itemElem.className = 'absolute cursor-pointer pointer-events-auto transform transition-transform hover:scale-115 active:scale-95 group z-25';
        
        const isKrathong = item.type === 'krathong';
        const isNewlyLaunched = (item.id === newlyLaunchedId);

        // Position accurately in River or Sky
        if (isKrathong) {
          // Foreground river: bottom 65px to 145px (closer to viewer)
          const bottomPos = 65 + (index * 20) % 75;
          itemElem.style.bottom = `${bottomPos}px`;
          itemElem.style.top = 'auto';
        } else {
          // Foreground sky: top 12% to 42%
          const topPos = 12 + (index * 16) % 30;
          itemElem.style.top = `${topPos}%`;
          itemElem.style.bottom = 'auto';
        }

        itemElem.style.left = '0px';

        // Animation configuration
        if (isNewlyLaunched) {
          if (isKrathong) {
            itemElem.style.animation = 'newKrathongSpawn 26s ease-out forwards';
          } else {
            itemElem.style.animation = 'newLanternSpawn 26s ease-out forwards';
          }
        } else {
          if (isKrathong) {
            const duration = 18 + (index % 4) * 3;
            const delay = -(((index * 5.2) + 2) % duration);
            itemElem.style.animation = `driftRiver ${duration}s linear ${delay}s infinite`;
          } else {
            const duration = 24 + (index % 4) * 4;
            const delay = -(((index * 6.1) + 3) % duration);
            itemElem.style.animation = `driftSkyLantern ${duration}s linear ${delay}s infinite`;
          }
        }

        // Attached photo or avatar
        const photoOrAvatar = item.imageUrl 
          ? `<img src="${item.imageUrl}" class="w-full h-full object-cover">`
          : (AVATARS_SVG[item.avatar || 0] || '🪷');

        const frameClass = item.designConfig?.frameStyle === 'heart' 
          ? 'rounded-full border-2 border-pink-400' 
          : 'rounded-full border-2 border-amber-400';

        // Special highlight badge and ripple for newly launched item
        const newBadge = isNewlyLaunched 
          ? `<div class="mb-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-2xl border-2 border-white animate-bounce flex items-center space-x-1">
               <span>✨</span><span>กระทงของคุณ ${escapeHtml(item.fullName)} (เพิ่งลอย)</span>
             </div>`
          : '';

        const rippleElem = (isNewlyLaunched && isKrathong) 
          ? `<div class="ripple-ring -bottom-1"></div>` 
          : '';

        itemElem.innerHTML = `
          <div class="relative flex flex-col items-center">
            ${newBadge}

            <!-- Wish speech bubble above item -->
            <div class="mb-1 bg-slate-900/95 text-amber-200 text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/60 shadow-lg whitespace-nowrap max-w-[140px] truncate opacity-95 group-hover:opacity-100 backdrop-blur-sm">
              ${escapeHtml(item.wish || 'ขอขมาพระแม่คงคา')}
            </div>

            <!-- Attached User Photo Sticker -->
            <div class="relative -mb-2 z-10 w-9 h-9 ${frameClass} bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center">
              ${photoOrAvatar}
            </div>

            <!-- Floating Object Base (Krathong or Lantern SVG) -->
            ${isKrathong ? getKrathongArtworkSVG(item.designConfig) : getLanternArtworkSVG(item.designConfig)}

            ${rippleElem}

            <!-- Prominent User Name Badge -->
            <div class="mt-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] px-3 py-0.5 rounded-full border-2 border-white shadow-xl max-w-[135px] truncate flex items-center space-x-1">
              <span class="text-xs">👤</span>
              <span>${escapeHtml(item.fullName)}</span>
            </div>
            <!-- Department Tag -->
            <div class="text-[9px] text-amber-200 font-semibold bg-slate-950/85 px-2 py-0.2 rounded-full border border-slate-700 max-w-[120px] truncate mt-0.5 shadow">
              ${escapeHtml(item.department)}
            </div>
          </div>
        `;

        itemElem.onclick = (e) => {
          e.stopPropagation();
          openDetailModal(item);
        };

        floatingRiverItemsContainer.appendChild(itemElem);
      });

      updateStatsCounters();
    }

    function updateStatsCounters() {
      const kCount = itemsDatabase.filter(i => i.type === 'krathong').length;
      const lCount = itemsDatabase.filter(i => i.type === 'lantern').length;
      document.getElementById('statKrathongCount').textContent = kCount;
      document.getElementById('statLanternCount').textContent = lCount;
    }

    // Krathong SVG generator based on config
    function getKrathongArtworkSVG(cfg = {}) {
      const candleColor = cfg.candle === 'red' ? '#EF4444' : '#F59E0B';
      const flowerColor = cfg.flowers === 'orchid' ? '#C084FC' : (cfg.flowers === 'jasmine' ? '#FFFFFF' : '#FBBF24');
      const baseGrad = cfg.base === 'lotus' ? '#EC4899' : (cfg.base === 'ice' ? '#38BDF8' : '#15803D');

      return `
        <svg width="74" height="58" viewBox="0 0 100 80" class="filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.65)] overflow-visible">
          <!-- Subtle water reflection beneath krathong -->
          <ellipse cx="50" cy="74" rx="36" ry="6" fill="rgba(245, 158, 11, 0.28)" class="animate-pulse" />

          <!-- Candle Glow -->
          <circle cx="50" cy="18" r="9" fill="${candleColor}" opacity="0.35" class="animate-pulse"/>
          <!-- Flame with natural flicker -->
          <g class="flame-flicker">
            <path d="M50,11 Q54,17 50,22 Q46,17 50,11 Z" fill="#FBBF24"/>
            <path d="M50,13 Q52,17 50,20 Q48,17 50,13 Z" fill="#FEF08A"/>
          </g>
          <!-- Incense and Candle Sticks -->
          <rect x="48" y="22" width="4" height="18" rx="1.5" fill="${candleColor}"/>
          <line x1="43" y1="25" x2="43" y2="42" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
          <line x1="57" y1="25" x2="57" y2="42" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
          <circle cx="43" cy="24" r="1.2" fill="#EF4444" class="animate-ping" />
          <circle cx="57" cy="24" r="1.2" fill="#EF4444" class="animate-ping" />
          
          <!-- Flowers & Arrangement -->
          <circle cx="34" cy="42" r="7" fill="${flowerColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
          <circle cx="66" cy="42" r="7" fill="${flowerColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
          <circle cx="50" cy="42" r="8" fill="#FDE047" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
          <circle cx="50" cy="42" r="3" fill="#D97706"/>

          <!-- Banana Leaves / Lotus Petals Base with richer shading -->
          <path d="M10,55 Q50,75 90,55 Q75,78 50,78 Q25,78 10,55 Z" fill="${baseGrad}" stroke="#064E3B" stroke-width="2"/>
          <path d="M15,50 Q30,68 50,68 Q70,68 85,50 Q50,62 15,50 Z" fill="${baseGrad}" opacity="0.88"/>
        </svg>
      `;
    }

    // Lantern SVG generator based on config
    function getLanternArtworkSVG(cfg = {}) {
      const color = cfg.color || '#FBBF24';
      return `
        <svg width="64" height="74" viewBox="0 0 100 120" class="filter drop-shadow-[0_0_20px_rgba(251,191,36,0.85)] overflow-visible">
          <!-- Fire Core with flicker -->
          <g class="flame-flicker">
            <circle cx="50" cy="100" r="10" fill="#F59E0B" opacity="0.9"/>
            <circle cx="50" cy="100" r="5" fill="#FEF08A"/>
          </g>
          <!-- Lantern Body with warm translucent look -->
          <path d="M25,25 Q15,65 30,105 L70,105 Q85,65 75,25 Z" fill="${color}" opacity="0.92" stroke="#B45309" stroke-width="2"/>
          <!-- Bamboo Ribs -->
          <line x1="38" y1="26" x2="42" y2="105" stroke="#78350F" stroke-width="1" opacity="0.5"/>
          <line x1="62" y1="26" x2="58" y2="105" stroke="#78350F" stroke-width="1" opacity="0.5"/>
          <!-- Top & Bottom Wooden Rings -->
          <ellipse cx="50" cy="25" rx="25" ry="6" fill="#78350F"/>
          <ellipse cx="50" cy="105" rx="20" ry="5" fill="#78350F"/>
          <!-- Inner Warm Glow Light -->
          <circle cx="50" cy="65" r="22" fill="#FEF3C7" opacity="0.8" class="animate-pulse-glow"/>
        </svg>
      `;
    }

    /* ========================================================
       7. DIY MODAL, REAL-TIME PREVIEW & IMAGE RESIZING
       ======================================================== */
    function openDIYModal(type = 'krathong') {
      currentDiyType = type;
      document.getElementById('diyModal').classList.remove('hidden');
      
      const title = document.getElementById('diyModalTitle');
      const step2Title = document.getElementById('diyStep2Title');
      const submitText = document.getElementById('submitLaunchBtnText');
      const kControls = document.getElementById('krathongCustomizerControls');
      const lControls = document.getElementById('lanternCustomizerControls');

      if (type === 'krathong') {
        title.innerHTML = '🪷 ประดิษฐ์กระทงออนไลน์';
        step2Title.textContent = 'ตกแต่งกระทง & รูปภาพติดกระทง';
        submitText.textContent = 'ปล่อยกระทงลงสายน้ำ';
        kControls.classList.remove('hidden');
        lControls.classList.add('hidden');
      } else {
        title.innerHTML = '🏮 ปล่อยโคมลอยสู่ท้องฟ้า';
        step2Title.textContent = 'ปรับแต่งโคมลอย & รูปภาพติดโคม';
        submitText.textContent = 'ปล่อยโคมลอยขึ้นสู่ท้องฟ้า';
        kControls.classList.add('hidden');
        lControls.classList.remove('hidden');
      }

      renderAvatarSelector();
      updateDiyItem();
    }

    function closeDIYModal() {
      document.getElementById('diyModal').classList.add('hidden');
    }

    function renderAvatarSelector() {
      const grid = document.getElementById('avatarSelectorGrid');
      grid.innerHTML = '';
      AVATARS_SVG.forEach((svg, idx) => {
        const btn = document.createElement('div');
        btn.className = `w-11 h-11 p-1 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${
          selectedAvatarIndex === idx ? 'border-amber-400 bg-amber-500/30 scale-105' : 'border-slate-700 bg-slate-800 hover:border-slate-500'
        }`;
        btn.innerHTML = svg;
        btn.onclick = () => {
          selectedAvatarIndex = idx;
          renderAvatarSelector();
          updateDiyItem();
        };
        grid.appendChild(btn);
      });
    }

    function updateDiyItem() {
      const container = document.getElementById('liveDiyPreview');
      const name = document.getElementById('inputFullName').value.trim() || 'ชื่อของคุณ';
      const frameStyle = document.querySelector('input[name="photoFrameStyle"]:checked')?.value || 'circle';

      const photoContent = uploadedPhotoBase64 
        ? `<img src="${uploadedPhotoBase64}" class="w-full h-full object-cover">`
        : AVATARS_SVG[selectedAvatarIndex];

      let frameBorder = 'border-2 border-amber-400 rounded-full';
      if (frameStyle === 'heart') {
        frameBorder = 'border-2 border-pink-400 rounded-full shadow-[0_0_10px_#ec4899]';
      } else if (frameStyle === 'flower') {
        frameBorder = 'border-2 border-yellow-300 rounded-full shadow-[0_0_10px_#fde047]';
      }

      const cfg = {
        base: document.getElementById('selKrathongBase')?.value,
        flowers: document.getElementById('selKrathongFlowers')?.value,
        candle: document.getElementById('selKrathongCandle')?.value,
        decor: document.getElementById('selKrathongDecor')?.value,
        shape: document.getElementById('selLanternShape')?.value,
        color: document.getElementById('selLanternColor')?.value,
        pattern: document.getElementById('selLanternPattern')?.value,
        frameStyle: frameStyle
      };

      const artwork = currentDiyType === 'krathong' 
        ? getKrathongArtworkSVG(cfg) 
        : getLanternArtworkSVG(cfg);

      container.innerHTML = `
        <div class="flex flex-col items-center animate-float-slow">
          <!-- Attached photo preview mounted on top -->
          <div class="relative -mb-4 z-20 w-16 h-16 ${frameBorder} bg-slate-900 overflow-hidden flex items-center justify-center">
            ${photoContent}
          </div>
          <div class="transform scale-125 my-1">
            ${artwork}
          </div>
          <div class="bg-slate-950/80 text-[11px] text-amber-300 font-semibold px-3 py-0.5 rounded-full border border-amber-500/40 shadow mt-1">
            ${escapeHtml(name)}
          </div>
        </div>
      `;
    }

    // Photo input handler with client-side compression & crop (250x250)
    function handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 260;
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext('2d');

          // Center crop square
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDim, maxDim);
          uploadedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);

          showToast("อัปโหลดและปักรูปภาพบนกระทงเรียบร้อยแล้ว!", "success");
          updateDiyItem();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function updateCharCount() {
      const txt = document.getElementById('inputWish').value;
      document.getElementById('charCounter').textContent = `${txt.length}/150`;
    }

    function pickPresetWish(cat) {
      const list = PRESET_WISHES[cat] || PRESET_WISHES.khoma;
      const randomWish = list[Math.floor(Math.random() * list.length)];
      document.getElementById('inputWish').value = randomWish;
      updateCharCount();
    }

    // Submit and launch into the river or sky
    async function submitLaunchItem() {
      const fullName = document.getElementById('inputFullName').value.trim();
      const department = document.getElementById('selectDepartment').value;
      const wish = document.getElementById('inputWish').value.trim() || "ขอขมาพระแม่คงคา และขอให้ครอบครัวมีความสุข";

      if (!fullName) {
        showToast("กรุณากรอกชื่อ-นามสกุลก่อนลอยกระทงครับ", "error");
        document.getElementById('inputFullName').focus();
        return;
      }

      const submitBtn = document.getElementById('submitLaunchBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> กำลังส่งข้อมูล...`;

      const frameStyle = document.querySelector('input[name="photoFrameStyle"]:checked')?.value || 'circle';
      const designConfig = {
        base: document.getElementById('selKrathongBase')?.value,
        flowers: document.getElementById('selKrathongFlowers')?.value,
        candle: document.getElementById('selKrathongCandle')?.value,
        decor: document.getElementById('selKrathongDecor')?.value,
        shape: document.getElementById('selLanternShape')?.value,
        color: document.getElementById('selLanternColor')?.value,
        pattern: document.getElementById('selLanternPattern')?.value,
        frameStyle: frameStyle
      };

      const newItem = {
        id: 'LK_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        type: currentDiyType,
        fullName: fullName,
        department: department,
        avatar: selectedAvatarIndex,
        wish: wish,
        imageUrl: uploadedPhotoBase64 || '', // Will be replaced by GAS drive URL if configured
        designConfig: designConfig,
        likes: 1
      };

      // Add to local database immediately so it renders without delay
      itemsDatabase.unshift(newItem);
      localStorage.setItem('loyKrathongItems', JSON.stringify(itemsDatabase.slice(0, 100)));

      // Trigger Celebration Fireworks and Sound
      playFireworksSound();
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Close modal and IMMEDIATELY render item on the river/sky with highlight
      closeDIYModal();
      renderFloatingItems(newItem.id);
      renderStageDancers();

      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane mr-1"></i> ${currentDiyType === 'krathong' ? 'ปล่อยกระทงลงสายน้ำ' : 'ปล่อยโคมลอยขึ้นสู่ท้องฟ้า'}`;

      showToast(`ปล่อย${currentDiyType === 'krathong' ? 'กระทง' : 'โคมลอย'}สำเร็จแล้ว! ลอยอยู่ในสายน้ำแล้วครับ`, "success");

      // Push to Google Apps Script asynchronously in background
      if (appConfig.gasUrl && appConfig.gasUrl.startsWith('https://script.google.com')) {
        const payload = {
          action: 'uploadAndSave',
          id: newItem.id,
          type: newItem.type,
          fullName: newItem.fullName,
          department: newItem.department,
          avatar: newItem.avatar,
          wish: newItem.wish,
          designConfig: JSON.stringify(designConfig),
          base64Image: uploadedPhotoBase64 || '',
          fileName: `loy_${Date.now()}.jpg`
        };

        fetch(appConfig.gasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(result => {
          if (result && result.imageUrl) {
            newItem.imageUrl = result.imageUrl;
            localStorage.setItem('loyKrathongItems', JSON.stringify(itemsDatabase.slice(0, 100)));
          }
        })
        .catch(err => {
          console.warn("GAS background sync note:", err);
        });
      }
    }

    /* ========================================================
       8. DETAIL MODAL (SHOW ON CLICK FLOATING ITEM)
       ======================================================== */
    let currentDetailItem = null;

    function openDetailModal(item) {
      currentDetailItem = item;
      const modal = document.getElementById('detailModal');
      modal.classList.remove('hidden');

      document.getElementById('detailFullName').textContent = item.fullName;
      document.getElementById('detailDepartment').textContent = item.department;
      document.getElementById('detailWish').textContent = `"${item.wish}"`;
      document.getElementById('detailLikeCount').textContent = item.likes || 1;
      
      const badge = document.getElementById('detailTypeBadge');
      if (item.isBot) {
        badge.textContent = item.type === 'krathong' ? 'กระทง (เพื่อนร่วมวิทยาลัย)' : 'โคมลอย (เพื่อนร่วมวิทยาลัย)';
      } else {
        badge.textContent = item.type === 'krathong' ? 'กระทง' : 'โคมลอย';
      }
      badge.className = item.type === 'krathong' 
        ? 'absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow'
        : 'absolute -bottom-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow';

      const photoContainer = document.getElementById('detailPhotoContainer');
      if (item.imageUrl) {
        photoContainer.innerHTML = `<img src="${item.imageUrl}" class="w-full h-full object-cover">`;
      } else {
        photoContainer.innerHTML = AVATARS_SVG[item.avatar || 0] || '🪷';
      }

      const d = new Date(item.timestamp);
      document.getElementById('detailTime').textContent = isNaN(d) ? 'วันนี้' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    function closeDetailModal() {
      document.getElementById('detailModal').classList.add('hidden');
    }

    function likeDetailItem() {
      if (!currentDetailItem) return;
      currentDetailItem.likes = (currentDetailItem.likes || 0) + 1;
      document.getElementById('detailLikeCount').textContent = currentDetailItem.likes;
      
      // Heart burst
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#EC4899', '#F43F5E', '#F59E0B']
      });

      localStorage.setItem('loyKrathongItems', JSON.stringify(itemsDatabase));
      showToast("ส่งกำลังใจและความปรารถนาดีเรียบร้อยแล้ว ❤️", "success");
    }

    /* ========================================================
       9. PARTICIPANTS DIRECTORY TABLE & CSV EXPORT
       ======================================================== */
    function openDirectoryModal() {
      document.getElementById('directoryModal').classList.remove('hidden');
      renderDirectoryTable();
    }

    function closeDirectoryModal() {
      document.getElementById('directoryModal').classList.add('hidden');
    }

    function renderDirectoryTable() {
      const tbody = document.getElementById('directoryTableBody');
      const search = document.getElementById('dirSearchInput').value.toLowerCase();
      const deptFilter = document.getElementById('dirDeptFilter').value;
      const typeFilter = document.getElementById('dirTypeFilter').value;

      let filtered = itemsDatabase.filter(item => {
        const matchSearch = item.fullName.toLowerCase().includes(search) || (item.wish && item.wish.toLowerCase().includes(search));
        const matchDept = deptFilter === 'all' || item.department === deptFilter;
        const matchType = typeFilter === 'all' || item.type === typeFilter;
        return matchSearch && matchDept && matchType;
      });

      document.getElementById('dirFilteredCount').textContent = filtered.length;
      document.getElementById('dirTotalCount').textContent = itemsDatabase.length;

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500">ไม่พบรายชื่อที่ค้นหา</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(item => {
        const photoOrAvatar = item.imageUrl 
          ? `<img src="${item.imageUrl}" class="w-8 h-8 rounded-full object-cover border border-amber-400">`
          : `<div class="w-8 h-8 rounded-full bg-slate-800 p-1 border border-slate-700">${AVATARS_SVG[item.avatar || 0]}</div>`;
        
        const typeBadge = item.type === 'krathong'
          ? `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px]">กระทง</span>`
          : `<span class="bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full text-[10px]">โคมลอย</span>`;

        const d = new Date(item.timestamp);
        const timeStr = isNaN(d) ? '-' : d.toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' });

        return `
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="py-2 px-3">${photoOrAvatar}</td>
            <td class="py-2 px-3">${typeBadge}</td>
            <td class="py-2 px-3 font-semibold text-white">${escapeHtml(item.fullName)}</td>
            <td class="py-2 px-3 text-slate-400">${escapeHtml(item.department)}</td>
            <td class="py-2 px-3 text-slate-300 max-w-xs truncate">${escapeHtml(item.wish || '-')}</td>
            <td class="py-2 px-3 text-right text-slate-500 text-[11px]">${timeStr}</td>
          </tr>
        `;
      }).join('');
    }

    function filterDirectoryTable() {
      renderDirectoryTable();
    }

    function exportParticipantsCSV() {
      if (itemsDatabase.length === 0) {
        showToast("ยังไม่มีข้อมูลสำหรับ Export CSV", "info");
        return;
      }

      let csv = "\uFEFF"; // UTF-8 BOM for Thai language Excel support
      csv += "ลำดับ,เวลา,ประเภท,ชื่อ-นามสกุล,แผนกวิชา,คำอธิษฐาน,จำนวนไลก์\n";

      itemsDatabase.forEach((item, idx) => {
        const time = new Date(item.timestamp).toLocaleString('th-TH');
        const type = item.type === 'krathong' ? 'กระทง' : 'โคมลอย';
        const cleanWish = (item.wish || '').replace(/"/g, '""');
        csv += `${idx + 1},"${time}","${type}","${item.fullName}","${item.department}","${cleanWish}",${item.likes || 1}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `loy_krathong_participants_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว", "success");
    }

    /* ========================================================
       10. DIGITAL ESIIMSI & STORY CANVAS MAKER (PAGE 2)
       ======================================================== */
    let isShakingEsiimsi = false;
    let currentFortune = null;

    function shakeEsiimsi() {
      if (isShakingEsiimsi) return;
      isShakingEsiimsi = true;

      const cylinder = document.getElementById('bambooCylinder');
      const fallingStick = document.getElementById('fallingStick');
      const resultCard = document.getElementById('fortuneResultCard');
      
      resultCard.classList.add('hidden');
      fallingStick.classList.add('opacity-0', '-translate-y-8');
      cylinder.classList.add('animate-shake-bamboo');

      // Play bamboo rattle sound
      playBambooShakeSound();

      setTimeout(() => {
        cylinder.classList.remove('animate-shake-bamboo');
        
        // Randomly pick fortune
        currentFortune = ESIIMSI_FORTUNES[Math.floor(Math.random() * ESIIMSI_FORTUNES.length)];
        
        // Pop out the bamboo stick
        document.getElementById('esiimsiStickNumber').textContent = currentFortune.num;
        fallingStick.classList.remove('opacity-0', '-translate-y-8');
        playStickDropSound();

        setTimeout(() => {
          // Display the fortune slip
          document.getElementById('fortuneTitle').textContent = currentFortune.title;
          document.getElementById('fortunePoem').textContent = `"${currentFortune.poem}"`;
          document.getElementById('fortuneStudy').textContent = currentFortune.study;
          document.getElementById('fortuneLove').textContent = currentFortune.love;
          document.getElementById('fortuneLuck').textContent = currentFortune.luck;

          resultCard.classList.remove('hidden');
          isShakingEsiimsi = false;

          // Confetti celebration
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        }, 600);
      }, 1200);
    }

    function resetEsiimsi() {
      document.getElementById('fortuneResultCard').classList.add('hidden');
      document.getElementById('fallingStick').classList.add('opacity-0', '-translate-y-8');
    }

    // HTML5 Canvas generator for IG/FB Story (1080 x 1920)
    function downloadFortuneCard() {
      if (!currentFortune) return;

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#0B132B');
      bgGrad.addColorStop(0.3, '#1C2541');
      bgGrad.addColorStop(1, '#070D1F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Decorative Border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, 1000, 1840);
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 960, 1800);

      // Header College Text
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 44px Kanit';
      ctx.textAlign = 'center';
      ctx.fillText(appConfig.collegeName, 540, 150);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '32px Kanit';
      ctx.fillText(`ประเพณีลอยกระทง ประจำปี ${appConfig.year}`, 540, 210);

      // Card container for fortune slip
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath();
      ctx.roundRect(100, 300, 880, 1380, 40);
      ctx.fill();
      ctx.strokeStyle = '#E2B16F';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Stamp Badge
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.roundRect(390, 270, 300, 60, 30);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px Kanit';
      ctx.fillText('เซียมซีนำโชค', 540, 312);

      // Slip Title & Number
      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 58px Kanit';
      ctx.fillText(currentFortune.title, 540, 420);

      ctx.fillStyle = '#64748B';
      ctx.font = '28px Kanit';
      const userName = document.getElementById('inputFullName').value.trim() || 'ผู้เสี่ยงทาย';
      ctx.fillText(`ผู้เสี่ยงทาย: ${userName}`, 540, 480);

      // Divider line
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(180, 520);
      ctx.lineTo(900, 520);
      ctx.stroke();

      // Poem
      ctx.fillStyle = '#78350F';
      ctx.font = 'italic bold 38px Kanit';
      wrapText(ctx, `"${currentFortune.poem}"`, 540, 620, 760, 55);

      // Detail Boxes
      drawDetailBox(ctx, 160, 780, 760, 180, 'การเรียน & การสอบ', currentFortune.study, '#1D4ED8', '#EFF6FF');
      drawDetailBox(ctx, 160, 1000, 760, 180, 'ความรัก & ความสัมพันธ์', currentFortune.love, '#BE185D', '#FDF2F8');
      drawDetailBox(ctx, 160, 1220, 760, 180, 'โชคลาภ & โอกาสดี', currentFortune.luck, '#047857', '#ECFDF5');

      // Footer Hashtag / Credit
      ctx.fillStyle = '#94A3B8';
      ctx.font = '30px Kanit';
      ctx.fillText('#ลอยกระทงออนไลน์ #วิทยาลัยเทคนิคท่าหลวงฯ', 540, 1530);

      // Convert to image and trigger download
      const imgURL = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `esiimsi_story_${currentFortune.num}.jpg`;
      link.href = imgURL;
      link.click();

      showToast("บันทึกรูปภาพใบเซียมซีสำหรับแชร์ลงสตอรี่แล้ว!", "success");
    }

    function drawDetailBox(ctx, x, y, w, h, title, text, titleColor, bgColor) {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 20);
      ctx.fill();
      ctx.strokeStyle = titleColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = titleColor;
      ctx.font = 'bold 36px Kanit';
      ctx.textAlign = 'left';
      ctx.fillText(`• ${title}`, x + 30, y + 55);

      ctx.fillStyle = '#1E293B';
      ctx.font = '30px Kanit';
      wrapText(ctx, text, x + 30, y + 115, w - 60, 42, 'left');
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = 'center') {
      ctx.textAlign = align;
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }

    // Motion Shake Detector for mobile devices
    if (window.DeviceMotionEvent) {
      let lastX, lastY, lastZ;
      let lastTime = 0;
      window.addEventListener('devicemotion', (e) => {
        if (currentPageIndex !== 1) return; // Only trigger on Esiimsi page
        const current = e.accelerationIncludingGravity;
        if (!current) return;
        const now = Date.now();
        if ((now - lastTime) > 100) {
          const diffTime = now - lastTime;
          lastTime = now;
          const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
          if (speed > 1100 && !isShakingEsiimsi) {
            shakeEsiimsi();
          }
          lastX = current.x;
          lastY = current.y;
          lastZ = current.z;
        }
      });
    }

    /* ========================================================
       11. RETRO RAMWONG STAGE & DANCERS (PAGE 3)
       ======================================================== */
    function renderStageDancers() {
      const container = document.getElementById('dancersStageContainer');
      if (!container) return;

      container.innerHTML = '';

      // Get 4-6 dancers: either from recent participants or default vocational characters
      let dancers = itemsDatabase.slice(0, 5);
      if (dancers.length < 4) {
        const defaultDancers = [
          { fullName: "น้องฝ้าย", department: "เทคโนโลยีคอมพิวเตอร์", avatar: 1 },
          { fullName: "ช่างเบิร์ด", department: "ช่างยนต์", avatar: 2 },
          { fullName: "น้องเมย์", department: "การบัญชี", avatar: 3 },
          { fullName: "พี่ก้อง", department: "ช่างไฟฟ้ากำลัง", avatar: 0 }
        ];
        dancers = [...dancers, ...defaultDancers].slice(0, 5);
      }

      dancers.forEach((dancer, idx) => {
        const dancerElem = document.createElement('div');
        dancerElem.className = 'flex flex-col items-center transform transition-transform animate-sway';
        dancerElem.style.animationDelay = `${idx * 0.4}s`;

        const photoOrAvatar = dancer.imageUrl
          ? `<img src="${dancer.imageUrl}" class="w-12 h-12 rounded-full object-cover border-2 border-amber-400">`
          : `<div class="w-12 h-12 rounded-full bg-slate-800 p-1 border-2 border-amber-400">${AVATARS_SVG[dancer.avatar || idx % AVATARS_SVG.length]}</div>`;

        dancerElem.innerHTML = `
          <!-- Dancing Avatar Head -->
          <div class="relative">
            <div class="shadow-lg">
              ${photoOrAvatar}
            </div>
            <!-- Traditional Flower Hair Garland -->
            <span class="absolute -top-1 -right-1 text-sm">🌺</span>
          </div>

          <!-- Thai Costume Torso & Waving Hands -->
          <div class="w-14 h-12 -mt-1 flex items-center justify-center relative">
            <!-- Left hand waving -->
            <span class="text-sm transform -rotate-45 -mr-1">🪷</span>
            <!-- Body -->
            <div class="w-9 h-11 bg-gradient-to-b from-amber-500 to-pink-600 rounded-t-lg border border-yellow-300 shadow"></div>
            <!-- Right hand waving -->
            <span class="text-sm transform rotate-45 -ml-1">🪷</span>
          </div>

          <!-- Name & Department Tag -->
          <div class="bg-slate-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-500/40 mt-1 whitespace-nowrap max-w-[85px] truncate shadow">
            ${escapeHtml(dancer.fullName)}
          </div>
          <div class="text-[8px] text-pink-300/80 truncate max-w-[80px]">
            ${escapeHtml(dancer.department)}
          </div>
        `;

        container.appendChild(dancerElem);
      });
    }

    function cheerAction(type) {
      const stageOverlay = document.getElementById('stageParticleOverlay');

      if (type === 'flower') {
        cheerGarlandCount += 1;
        document.getElementById('countGarlands').textContent = `${cheerGarlandCount} พวง`;
        localStorage.setItem('cheerGarlands', cheerGarlandCount);
        createFlyingPetalParticles('🌺');
        showToast("คล้องพวงมาลัยให้นักเต้นรำวงแล้ว! 🌺", "success");
      } else {
        cheerClapCount += 1;
        document.getElementById('countClaps').textContent = `${cheerClapCount} ครั้ง`;
        localStorage.setItem('cheerClaps', cheerClapCount);
        createFlyingPetalParticles('👏');
        playSynthNote(880, 0.15, 'triangle');
        showToast("ส่งเสียงปรบมือ กรี๊ดดดดด! 👏", "info");
      }
    }

    function createFlyingPetalParticles(emoji) {
      const stage = document.getElementById('stageParticleOverlay');
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'absolute text-xl pointer-events-none transition-all duration-1000';
        p.textContent = emoji;
        p.style.left = `${20 + Math.random() * 60}%`;
        p.style.bottom = '10px';
        p.style.transform = 'translateY(0) scale(0.8)';
        p.style.opacity = '1';
        stage.appendChild(p);

        setTimeout(() => {
          p.style.transform = `translate(${(Math.random() - 0.5) * 120}px, -${120 + Math.random() * 100}px) scale(1.4)`;
          p.style.opacity = '0';
        }, 30);

        setTimeout(() => {
          p.remove();
        }, 1100);
      }
    }

    /* ========================================================
       12. ADMIN SETTINGS & DONATION MODAL
       ======================================================== */
    function openAdminSettingsModal() {
      document.getElementById('adminModal').classList.remove('hidden');
      document.getElementById('adminAuthSection').classList.remove('hidden');
      document.getElementById('adminFormSection').classList.add('hidden');
      document.getElementById('adminPasswordInput').value = '';
    }

    function closeAdminSettingsModal() {
      document.getElementById('adminModal').classList.add('hidden');
    }

    function verifyAdminPassword() {
      const input = document.getElementById('adminPasswordInput').value;
      if (input === appConfig.adminPassword) {
        document.getElementById('adminAuthSection').classList.add('hidden');
        document.getElementById('adminFormSection').classList.remove('hidden');

        // Populate fields
        document.getElementById('cfgCollegeName').value = appConfig.collegeName;
        document.getElementById('cfgYear').value = appConfig.year;
        document.getElementById('cfgGasUrl').value = appConfig.gasUrl || '';
        document.getElementById('cfgDepartments').value = appConfig.departments.join(', ');
      } else {
        showToast("รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้น: 1234)", "error");
      }
    }

    function saveAdminSettings() {
      const cName = document.getElementById('cfgCollegeName').value.trim();
      const yr = document.getElementById('cfgYear').value.trim();
      const newPw = document.getElementById('cfgNewPassword').value.trim();
      const gas = document.getElementById('cfgGasUrl').value.trim();
      const depts = document.getElementById('cfgDepartments').value.split(',').map(s => s.trim()).filter(Boolean);

      if (cName) appConfig.collegeName = cName;
      if (yr) appConfig.year = yr;
      if (newPw) appConfig.adminPassword = newPw;
      appConfig.gasUrl = gas;
      if (depts.length) appConfig.departments = depts;

      localStorage.setItem('loyKrathongConfig', JSON.stringify(appConfig));
      applyConfigToUI();
      closeAdminSettingsModal();
      showToast("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
    }

    function applyConfigToUI() {
      document.getElementById('headerTitle').textContent = `ลอยกระทงออนไลน์ ${appConfig.year}`;
      document.getElementById('headerSubtitle').textContent = appConfig.collegeName;

      // Populate department dropdowns
      const sel = document.getElementById('selectDepartment');
      const dirSel = document.getElementById('dirDeptFilter');
      
      sel.innerHTML = appConfig.departments.map(d => `<option value="${d}">${d}</option>`).join('');
      dirSel.innerHTML = `<option value="all">ทุกแผนกวิชา</option>` + appConfig.departments.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    function openDonateModal() {
      document.getElementById('donateModal').classList.remove('hidden');
    }

    function closeDonateModal() {
      document.getElementById('donateModal').classList.add('hidden');
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast("คัดลอกเลขบัญชี 4130745003 เรียบร้อยแล้ว", "success");
        });
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast("คัดลอกเลขบัญชี 4130745003 เรียบร้อยแล้ว", "success");
      }
    }

    /* ========================================================
       13. TOAST NOTIFICATION & UTILITIES
       ======================================================== */
    let toastTimeout = null;
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toastNotification');
      const msg = document.getElementById('toastMessage');
      const icon = document.getElementById('toastIcon');

      msg.textContent = message;
      if (type === 'success') {
        icon.className = 'fa-solid fa-circle-check text-emerald-400';
      } else if (type === 'error') {
        icon.className = 'fa-solid fa-circle-exclamation text-rose-500';
      } else {
        icon.className = 'fa-solid fa-circle-info text-amber-400';
      }

      toast.classList.remove('opacity-0', '-translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4');
      }, 3000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    /* ========================================================
       14. INITIALIZATION ON WINDOW LOAD
       ======================================================== */
    window.addEventListener('DOMContentLoaded', () => {
      applyConfigToUI();
      initCanvasDimensions();
      animateRiverCanvas();

      // Seed initial dummy items if list is empty for immediate rich experience
      if (itemsDatabase.length === 0) {
        itemsDatabase = [
          {
            id: 'LK_INIT_1',
            timestamp: new Date().toISOString(),
            type: 'krathong',
            fullName: 'สมชาย สายลุย',
            department: 'ช่างเทคโนโลยีคอมพิวเตอร์',
            avatar: 0,
            wish: 'ขอขมาพระแม่คงคา และขอให้โปรเจกต์ผ่านฉลุย เกรดสี่ทุกวิชาครับ',
            likes: 12,
            designConfig: { base: 'banana', flowers: 'marigold', candle: 'gold', frameStyle: 'circle' }
          },
          {
            id: 'LK_INIT_2',
            timestamp: new Date().toISOString(),
            type: 'lantern',
            fullName: 'กานดา สดใส',
            department: 'การบัญชี',
            avatar: 1,
            wish: 'ขอให้ครอบครัวมีสุขภาพแข็งแรง ร่ำรวยเงินทอง มีแต่ความสุข',
            likes: 19,
            designConfig: { shape: 'traditional', color: '#FBBF24', frameStyle: 'heart' }
          },
          {
            id: 'LK_INIT_3',
            timestamp: new Date().toISOString(),
            type: 'krathong',
            fullName: 'ช่างบอย ซอยแปด',
            department: 'ช่างยนต์',
            avatar: 2,
            wish: 'ขอให้ปีนี้สอบผ่านช็อปปฏิบัติการ แข่งขันชนะเลิศอันดับหนึ่ง!',
            likes: 8,
            designConfig: { base: 'lotus', flowers: 'orchid', candle: 'red', frameStyle: 'circle' }
          }
        ];
        localStorage.setItem('loyKrathongItems', JSON.stringify(itemsDatabase));
      }

      renderFloatingItems();
      renderStageDancers();
      document.getElementById('countGarlands').textContent = `${cheerGarlandCount} พวง`;
      document.getElementById('countClaps').textContent = `${cheerClapCount} ครั้ง`;

      // Fetch latest from Google Apps Script if URL provided
      if (appConfig.gasUrl && appConfig.gasUrl.startsWith('https://script.google.com')) {
        fetch(`${appConfig.gasUrl}?action=getList`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              itemsDatabase = data;
              localStorage.setItem('loyKrathongItems', JSON.stringify(itemsDatabase));
              renderFloatingItems();
              renderStageDancers();
            }
          })
          .catch(e => console.warn("GAS fetch error:", e));
      }
    });

    window.addEventListener('resize', () => {
      initCanvasDimensions();
    });
  