// Auto-import script - run this in browser console on the app page
(async function() {
    const LESSONS_KEY = 'vocabmaster_lessons';
    const DB_KEY = 'vocabmaster_words';

    function loadWords() { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
    function saveWords(w) { localStorage.setItem(DB_KEY, JSON.stringify(w)); }
    function loadLessons() { return JSON.parse(localStorage.getItem(LESSONS_KEY) || '[]'); }
    function saveLessons(l) { localStorage.setItem(LESSONS_KEY, JSON.stringify(l)); }

    function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

    // Create lessons
    const lessonDefs = [
        { name: "Quần áo & Phụ kiện", desc: "Clothing & Accessories" },
        { name: "Địa điểm & Không gian", desc: "Places & Spaces" },
        { name: "Hành động & Tư thế", desc: "Actions & Postures" },
        { name: "Đồ vật & Thiết bị", desc: "Objects & Equipment" },
        { name: "Ngoại hình & Trang phục", desc: "Appearance & Outfits" }
    ];

    const lessons = loadLessons();
    const newLessons = [];
    for (const ld of lessonDefs) {
        if (!lessons.find(l => l.name === ld.name)) {
            const l = { id: makeId(), name: ld.name, description: ld.desc, createdAt: new Date().toISOString() };
            lessons.push(l);
            newLessons.push(l);
            await new Promise(r => setTimeout(r, 5));
        } else {
            newLessons.push(lessons.find(l => l.name === ld.name));
        }
    }
    saveLessons(lessons);

    const lid = {};
    newLessons.forEach(l => { lid[l.name] = l.id; });

    const data = [
        // Quần áo & Phụ kiện
        ["a swimsuit / swimming trunks", "đồ bơi / quần bơi", "", lid["Quần áo & Phụ kiện"]],
        ["a blouse", "áo sơ mi nữ", "", lid["Quần áo & Phụ kiện"]],
        ["a floral dress", "váy hoa", "", lid["Quần áo & Phụ kiện"]],
        ["a suit", "bộ com lê / âu phục", "", lid["Quần áo & Phụ kiện"]],
        ["a vest", "áo gi-lê", "", lid["Quần áo & Phụ kiện"]],
        ["formal clothes", "quần áo trang trọng", "", lid["Quần áo & Phụ kiện"]],
        ["sportswear", "quần áo thể thao", "", lid["Quần áo & Phụ kiện"]],
        ["a ring", "nhẫn", "", lid["Quần áo & Phụ kiện"]],
        ["earrings", "hoa tai / khuyên tai", "", lid["Quần áo & Phụ kiện"]],
        ["a bracelet", "vòng tay", "", lid["Quần áo & Phụ kiện"]],
        ["a necklace", "vòng cổ / dây chuyền", "", lid["Quần áo & Phụ kiện"]],
        ["a belt", "thắt lưng", "", lid["Quần áo & Phụ kiện"]],
        ["a headband", "băng đô", "", lid["Quần áo & Phụ kiện"]],
        ["sunglasses", "kính râm", "", lid["Quần áo & Phụ kiện"]],
        ["boots", "bốt / ủng", "", lid["Quần áo & Phụ kiện"]],
        ["high heels", "giày cao gót", "", lid["Quần áo & Phụ kiện"]],
        ["light clothes", "quần áo mỏng / nhẹ", "", lid["Quần áo & Phụ kiện"]],

        // Địa điểm & Không gian
        ["pier", "bến tàu (nhô ra mặt nước)", "", lid["Địa điểm & Không gian"]],
        ["dock", "bến tàu / vũng tàu đậu", "", lid["Địa điểm & Không gian"]],
        ["outdoor café", "quán cà phê ngoài trời", "", lid["Địa điểm & Không gian"]],
        ["attic", "gác xép", "", lid["Địa điểm & Không gian"]],
        ["porch", "hiên nhà", "", lid["Địa điểm & Không gian"]],
        ["stairway", "cầu thang", "", lid["Địa điểm & Không gian"]],
        ["stairwell", "buồng thang bộ", "", lid["Địa điểm & Không gian"]],
        ["doorway", "cửa ra vào", "", lid["Địa điểm & Không gian"]],
        ["square", "quảng trường", "", lid["Địa điểm & Không gian"]],
        ["stockroom", "phòng chứa hàng", "", lid["Địa điểm & Không gian"]],
        ["storeroom", "nhà kho / phòng kho", "", lid["Địa điểm & Không gian"]],
        ["flea market", "chợ trời", "", lid["Địa điểm & Không gian"]],
        ["laboratory", "phòng thí nghiệm", "", lid["Địa điểm & Không gian"]],
        ["construction site", "công trường xây dựng", "", lid["Địa điểm & Không gian"]],
        ["hallway / hall", "hành lang / đại sảnh", "", lid["Địa điểm & Không gian"]],
        ["intersection", "ngã tư / giao lộ", "", lid["Địa điểm & Không gian"]],
        ["train station platform", "sân ga xe lửa", "", lid["Địa điểm & Không gian"]],
        ["tourist attraction", "điểm thu hút khách du lịch", "", lid["Địa điểm & Không gian"]],
        ["warehouse", "nhà kho", "", lid["Địa điểm & Không gian"]],

        // Hành động & Tư thế
        ["leading a horse", "dắt ngựa", "", lid["Hành động & Tư thế"]],
        ["making an order / taking an order", "gọi món / nhận gọi món", "", lid["Hành động & Tư thế"]],
        ["giving a presentation", "thuyết trình", "", lid["Hành động & Tư thế"]],
        ["lifting sth", "nâng / nhấc cái gì đó", "", lid["Hành động & Tư thế"]],
        ["walking alongside", "đi bộ bên cạnh", "", lid["Hành động & Tư thế"]],
        ["riding on sth", "cưỡi / đi trên cái gì đó", "", lid["Hành động & Tư thế"]],
        ["strolling", "đi dạo", "", lid["Hành động & Tư thế"]],
        ["serving oneself", "tự phục vụ", "", lid["Hành động & Tư thế"]],
        ["listening attentively", "chăm chú lắng nghe", "", lid["Hành động & Tư thế"]],
        ["boarding", "lên máy bay / tàu / xe", "", lid["Hành động & Tư thế"]],
        ["jogging", "chạy bộ", "", lid["Hành động & Tư thế"]],
        ["handing over sth to sb", "đưa / giao cái gì đó cho ai", "", lid["Hành động & Tư thế"]],
        ["making some gestures", "làm một số cử chỉ / điệu bộ", "", lid["Hành động & Tư thế"]],
        ["getting on / getting off", "lên / xuống (xe, tàu, máy bay)", "", lid["Hành động & Tư thế"]],
        ["crossing the road", "đi bộ qua đường / sang đường", "", lid["Hành động & Tư thế"]],
        ["reaching for something", "với lấy cái gì đó", "", lid["Hành động & Tư thế"]],
        ["examining sth", "kiểm tra / xem xét cái gì đó", "", lid["Hành động & Tư thế"]],
        ["loading something", "chất / bốc hàng lên", "", lid["Hành động & Tư thế"]],
        ["sitting cross-legged", "ngồi vắt chéo chân / khoanh chân", "", lid["Hành động & Tư thế"]],
        ["resting arms on sth", "tì tay lên cái gì đó", "", lid["Hành động & Tư thế"]],
        ["searching in sth", "tìm kiếm trong cái gì đó", "", lid["Hành động & Tư thế"]],
        ["unloading something", "dỡ hàng xuống", "", lid["Hành động & Tư thế"]],
        ["resting one's chin on one's hand", "chống cằm", "", lid["Hành động & Tư thế"]],
        ["looking at the same direction", "nhìn về cùng một hướng", "", lid["Hành động & Tư thế"]],
        ["wrapping sth", "gói / bọc cái gì đó", "", lid["Hành động & Tư thế"]],
        ["stacking", "xếp chồng", "", lid["Hành động & Tư thế"]],
        ["packaging sth", "đóng gói cái gì đó", "", lid["Hành động & Tư thế"]],
        ["sealing sth", "niêm phong / bịt kín cái gì đó", "", lid["Hành động & Tư thế"]],
        ["working with sth", "làm việc với cái gì đó", "", lid["Hành động & Tư thế"]],
        ["raking leaves", "cào lá", "", lid["Hành động & Tư thế"]],
        ["folding one's arm", "khoanh tay", "", lid["Hành động & Tư thế"]],
        ["crouching down", "ngồi xổm", "", lid["Hành động & Tư thế"]],
        ["kneeling down", "quỳ xuống", "", lid["Hành động & Tư thế"]],
        ["leaning back in his seat", "tựa lưng vào ghế", "", lid["Hành động & Tư thế"]],
        ["crawling on the floor", "bò trên sàn nhà", "", lid["Hành động & Tư thế"]],
        ["clasping fingers", "đan các ngón tay vào nhau", "", lid["Hành động & Tư thế"]],
        ["climbing a ladder", "leo thang", "", lid["Hành động & Tư thế"]],
        ["shoulder riding", "kiệu trên vai / cõng trên vai", "", lid["Hành động & Tư thế"]],
        ["toast", "nâng ly chúc mừng", "", lid["Hành động & Tư thế"]],
        ["weighing", "cân (đo trọng lượng)", "", lid["Hành động & Tư thế"]],
        ["hold sb on one's lap", "bế ai đó trên đùi", "", lid["Hành động & Tư thế"]],
        ["hold sb in one's arm", "bế / ôm ai đó trong vòng tay", "", lid["Hành động & Tư thế"]],
        ["be hanging down from", "được treo rủ xuống từ", "", lid["Hành động & Tư thế"]],
        ["be scattered", "bị rải rác / vương vãi", "", lid["Hành động & Tư thế"]],
        ["be planted along / on sth", "được trồng dọc theo / trên cái gì đó", "", lid["Hành động & Tư thế"]],
        ["be blocked with", "bị chặn bởi", "", lid["Hành động & Tư thế"]],
        ["be sorted / be organized by kind", "được phân loại / được sắp xếp theo loại", "", lid["Hành động & Tư thế"]],
        ["be stacked up", "được xếp chồng lên nhau", "", lid["Hành động & Tư thế"]],
        ["be packed with / be full of", "chật ních / chứa đầy", "", lid["Hành động & Tư thế"]],

        // Đồ vật & Thiết bị
        ["forklift", "xe nâng", "", lid["Đồ vật & Thiết bị"]],
        ["microscope", "kính hiển vi", "", lid["Đồ vật & Thiết bị"]],
        ["telescope", "kính thiên văn", "", lid["Đồ vật & Thiết bị"]],
        ["receiver", "ống nghe điện thoại / máy thu", "", lid["Đồ vật & Thiết bị"]],
        ["signpost", "biển chỉ đường", "", lid["Đồ vật & Thiết bị"]],
        ["leash", "dây xích chó / dây dắt thú cưng", "", lid["Đồ vật & Thiết bị"]],
        ["stethoscope", "ống nghe y tế", "", lid["Đồ vật & Thiết bị"]],
        ["binoculars", "ống nhòm", "", lid["Đồ vật & Thiết bị"]],
        ["luggage cart", "xe đẩy hành lý", "", lid["Đồ vật & Thiết bị"]],
        ["tricycle", "xe đạp ba bánh", "", lid["Đồ vật & Thiết bị"]],
        ["sun lounger", "ghế dài tắm nắng", "", lid["Đồ vật & Thiết bị"]],
        ["lab equipment", "thiết bị phòng thí nghiệm", "", lid["Đồ vật & Thiết bị"]],
        ["x-ray picture", "phim chụp X-quang", "", lid["Đồ vật & Thiết bị"]],
        ["awning", "mái hiên che nắng / mưa", "", lid["Đồ vật & Thiết bị"]],
        ["baked goods", "đồ nướng / bánh ngọt", "", lid["Đồ vật & Thiết bị"]],
        ["parasol", "cái lọng / ô che nắng lớn", "", lid["Đồ vật & Thiết bị"]],
        ["cooking utensil", "dụng cụ nấu ăn", "", lid["Đồ vật & Thiết bị"]],
        ["display window", "tủ kính trưng bày", "", lid["Đồ vật & Thiết bị"]],
        ["flip chart", "bảng kẹp giấy", "", lid["Đồ vật & Thiết bị"]],
        ["display case", "tủ trưng bày", "", lid["Đồ vật & Thiết bị"]],
        ["sport equipment", "dụng cụ thể thao", "", lid["Đồ vật & Thiết bị"]],
        ["exhibit", "vật triển lãm / hiện vật", "", lid["Đồ vật & Thiết bị"]],
        ["projector screen", "màn hình máy chiếu", "", lid["Đồ vật & Thiết bị"]],
        ["ski lift", "cáp treo trượt tuyết", "", lid["Đồ vật & Thiết bị"]],
        ["skis", "ván trượt tuyết", "", lid["Đồ vật & Thiết bị"]],

        // Ngoại hình & Trang phục
        ["a mustache", "ria mép", "", lid["Ngoại hình & Trang phục"]],
        ["whiskers", "râu quai hàm / râu ria", "", lid["Ngoại hình & Trang phục"]],
        ["blond hair", "tóc vàng", "", lid["Ngoại hình & Trang phục"]],
        ["straight hair", "tóc thẳng", "", lid["Ngoại hình & Trang phục"]],
        ["curly hair", "tóc xoăn", "", lid["Ngoại hình & Trang phục"]],
        ["wavy hair", "tóc gợn sóng", "", lid["Ngoại hình & Trang phục"]],
        ["a beard", "râu", "", lid["Ngoại hình & Trang phục"]],
        ["a tracksuit", "bộ quần áo thể thao", "", lid["Ngoại hình & Trang phục"]],
        ["a checked shirt", "áo sơ mi kẻ ca rô", "", lid["Ngoại hình & Trang phục"]],
        ["a striped shirt", "áo sơ mi kẻ sọc", "", lid["Ngoại hình & Trang phục"]],
        ["a polka dot shirt", "áo sơ mi chấm bi", "", lid["Ngoại hình & Trang phục"]],
        ["a turtleneck", "áo len cổ lọ", "", lid["Ngoại hình & Trang phục"]],
        ["a cardigan", "áo khoác len mỏng (cardigan)", "", lid["Ngoại hình & Trang phục"]],
        ["a uniform", "đồng phục", "", lid["Ngoại hình & Trang phục"]],
        ["a lab coat", "áo khoác phòng thí nghiệm", "", lid["Ngoại hình & Trang phục"]],
        ["a hospital gown", "áo bệnh nhân / áo choàng bệnh viện", "", lid["Ngoại hình & Trang phục"]],
        ["a short-sleeved shirt", "áo sơ mi ngắn tay", "", lid["Ngoại hình & Trang phục"]],
        ["a long-sleeved shirt", "áo sơ mi dài tay", "", lid["Ngoại hình & Trang phục"]],
        ["an apron", "tạp dề", "", lid["Ngoại hình & Trang phục"]],
        ["a tank top", "áo ba lỗ", "", lid["Ngoại hình & Trang phục"]],
        ["a coat", "áo khoác ngoài", "", lid["Ngoại hình & Trang phục"]],
        ["overalls", "quần yếm / đồ bảo hộ", "", lid["Ngoại hình & Trang phục"]],
        ["a sleeveless dress", "váy sát nách / váy không tay", "", lid["Ngoại hình & Trang phục"]],
    ];

    // Fetch phonetics in batches
    const words = loadWords();
    let added = 0;
    const batchSize = 5;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const phonetics = await Promise.all(batch.map(async ([en]) => {
            try {
                const w = en.split('/')[0].replace(/^a |^an /i,'').trim();
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
                if (!res.ok) return '';
                const d = await res.json();
                if (!d[0]) return '';
                const ph = d[0].phonetics || [];
                const wt = ph.find(p => p.text) || {};
                return wt.text || d[0].phonetic || '';
            } catch { return ''; }
        }));

        batch.forEach(([en, vn, ex, lessonId], j) => {
            // Skip if word already exists
            if (words.find(w => w.english === en)) return;
            words.unshift({
                id: makeId(),
                english: en,
                vietnamese: vn,
                example: ex,
                phonetic: phonetics[j],
                lessonId: lessonId,
                isMastered: false,
                createdAt: new Date().toISOString(),
                reviewCount: 0
            });
            added++;
        });

        console.log(`Imported ${Math.min(i + batchSize, data.length)}/${data.length}...`);
    }

    saveWords(words);
    alert(`✅ Đã nhập ${added} từ mới vào 5 bài học!\n\n📂 Quần áo & Phụ kiện\n📂 Địa điểm & Không gian\n📂 Hành động & Tư thế\n📂 Đồ vật & Thiết bị\n📂 Ngoại hình & Trang phục`);
    location.reload();
})();
