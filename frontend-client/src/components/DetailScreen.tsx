import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert, Trophy, LayoutGrid, Sparkles, Building2 } from 'lucide-react';

// Import real corporate images generated for the system
import img_map from '../assets/images/input_file_4_1782294561336.jpg';
import img_certs from '../assets/images/viettien_brand_trophy_1783068219731.jpg';
import img_vietnam_hq from '../assets/images/vietnam_high_quality_logo_1783068564687.jpg';
import { MEDIA } from '../assets/media';

interface DetailScreenProps {
  type: 'introduction' | 'overview' | 'achievements' | 'security' | 'trends';
}

export const DetailScreen: React.FC<DetailScreenProps> = ({ type }) => {
  const { setActiveScreen } = useApp();

  // Screen configuration based on the selected type
  const getScreenConfig = () => {
    switch (type) {
      case 'introduction':
        return {
          headerTitle: 'Giới thiệu về chúng tôi',
          title: 'Giới thiệu về chúng tôi',
          subtitle: 'Lịch sử hình thành và phát triển của Tổng Công ty Cổ phần May Việt Tiến',
          icon: <Building2 className="w-12 h-12 text-[#00BCD4]" />,
          imageSrc: MEDIA.banners[0], // Trụ sở Việt Tiến + trời xanh - ảnh banner mặc định
          content: (
            <div className="space-y-4 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <p className="font-semibold text-slate-900 dark:text-white">
                May Việt Tiến tên đầy đủ là Tổng Công ty Cổ phần May Việt Tiến, tên tiếng anh là Viettien Garment Corporation viết tắt là Vtec. Việt Tiến được thành lập năm 1975, hiện nay là doanh nghiệp dệt may hàng đầu trong lĩnh vực dệt may và được đông đảo khách hàng tin dùng.
              </p>

              <div className="my-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <img 
                  src={MEDIA.banners[0]} 
                  alt="Trụ sở lâu đời của May Việt Tiến" 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/60 p-2 text-center uppercase tracking-wider border-t border-slate-100">
                  Biển đá lịch sử của Tổng Công ty May Việt Tiến tại Lê Minh Xuân
                </p>
              </div>
              
              <div className="border-l-4 border-[#00BCD4] pl-3.5 space-y-3.5 my-4">
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1975</span>
                  <p className="text-slate-600 dark:text-slate-400">Những người lính đến Sài Gòn để tiếp quản công việc mới với rất nhiều khó khăn.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Ngày 29/11/1975</span>
                  <p className="text-slate-600 dark:text-slate-400">Bà Nguyễn Thị Hạnh được Nhà nước giao nhiệm vụ tiếp quản Thái Bình Dương kỹ nghệ công ty - đây vốn là một nhà máy tư nhân của người Hoa trước đây.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Ngày 20/11/1976</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty tiến hành đổi tên thành Xí nghiệp may Việt Tiến.</p>
                </div>

                <div className="my-3 overflow-hidden rounded-xl border border-slate-100">
                  <img 
                    src={MEDIA.banners[1]} 
                    alt="Nhà máy Công Tiến" 
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[9px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/60 p-1.5 text-center">
                    Nhà máy may công ty cổ phần Công Tiến trực thuộc hệ thống
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1986</span>
                  <p className="text-slate-600 dark:text-slate-400">Đất nước có bước chuyển mình mạnh mẽ về kinh tế chuyển từ mô hình kinh tế kế hoạch hóa tập trung chỉ có hai thành phần kinh tế nhà nước và tập thể sang mô hình kinh tế hàng hóa nhiều thành phần.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Ngày 1/8/1989</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty thành viên đầu tiên của Việt Tiến ra đời mang tên Xí nghiệp liên doanh May Tây Đô chuyên sản xuất áo sơ mi và quần tây các loại.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1990</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty cổ phần Đồng Tiến chính thức ra đời chuyên sản xuất các mặt hàng jacket, quần các loại,... xuất khẩu sang thị trường như Hoa Kỳ, Nhật, Canada, Đài Loan,...</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Ngày 24/2/1990</span>
                  <p className="text-slate-600 dark:text-slate-400">Việt Tiến được nâng từ Xí nghiệp lên thành Công ty may Việt Tiến theo quyết định của Bộ công nghiệp.</p>
                </div>

                <div className="my-3 overflow-hidden rounded-xl border border-slate-100">
                  <img 
                    src={MEDIA.banners[2]} 
                    alt="Đội ngũ nhân sự Việt Tiến" 
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[9px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/60 p-1.5 text-center">
                    Tập thể cán bộ công nhân viên gắn bó, chuyên nghiệp cùng kiến tạo tương lai
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1991</span>
                  <p className="text-slate-600 dark:text-slate-400">Xí nghiệp liên doanh chuyên sản xuất tấm bông PE ra đời. Cũng trong năm này, Cửa hàng Hợp tác kinh doanh Việt Tiến - Tung Shin cũng được thành lập.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1992</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty liên doanh thêu Việt Dương được hình thành.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1993</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty tiến hành lập Liên doanh sản xuất Nút nhựa Việt Thuận và Công ty Cổ Phần Sản xuất kinh doanh Tấm Bông Hà Nội EVC. Cũng trong năm này, Việt Tiến thành lập chi nhánh tại Hà Nội - đánh dấu bước ngoặt quan trọng trong việc khai thác thị trường phía Bắc.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 1994</span>
                  <p className="text-slate-600 dark:text-slate-400">Xí nghiệp M&S VTEC hình thành; Việt Tiến thành lập Công ty Cổ phần may Tiền Tiến tại Tiền Giang; Thành lập Cửa hàng hợp tác kinh doanh Việt Tiến – Clipsal.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Nhà máy Việt Tiến Năm 1995</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Trách nhiệm hữu hạn May xuất khẩu Việt Hồng ra đời tại Bến Tre; Hình thành Công ty Trách nhiệm hữu hạn Mex Việt Pháp; Xí nghiệp dệt len Visoni được hình thành.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Giai đoạn 3: Từ năm 1996 đến năm 2007 - Hội nhập và phát triển</span>
                  <p className="text-[#00BCD4] font-bold">Năm 1997: Thành lập Công ty Cổ phần may Việt Tân tại huyện Cai Lậy, tỉnh Tiền Giang chuyên về sản xuất các loại quần tây lẫn quần Kaki.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2001</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Cổ phần Việt Hưng ra đời chuyên sản xuất các loại áo sơ mi nam nữ.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2003</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Trách nhiệm hữu hạn May Tiến Thuận được thành lập chuyên may các mặt hàng jacket và đồ bộ thể thao cho các thương hiệu nổi tiếng.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2004</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Trách nhiệm hữu hạn may Thuận Tiến được ra đời chuyên sản xuất mặt hàng áo sơ mi các loại.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2005</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Cổ phần may Việt Thịnh được thành lập tại Tân Phú chuyên sản xuất các mặt hàng như Jacket, Bộ thể thao, Quần u, Quần Kaki, Vest,... Cũng trong năm này, Công ty Cổ phần Cơ khí Thủ Đức chính thức được ra đời chuyên sản xuất và gia công các loại thiết bị, phụ tùng, công cụ cho ngành dệt may.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2006</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Cổ phần May Công Tiến, Công ty Trách nhiệm hữu hạn Nam Thiên, Công ty Cổ phần may Vĩnh Tiến ra đời.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2007</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Việt Tiến - Đông Á ra đời với lĩnh vực kinh doanh chính là bất động sản công nghiệp, xây dựng công nghiệp và dân dụng, đầu tư hạ tầng khu công nghiệp tại Nhơn Trạch - Đồng Nai.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2008</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Trách nhiệm hữu hạn Nhãn thời gian ra đời tại Khu công nghiệp Dệt may Bình An chuyên sản xuất nhãn dệt các loại.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2010</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty trách nhiệm hữu hạn Việt Tiến Meko ra đời chuyên sản xuất kinh doanh chăn - ga - gối.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2013</span>
                  <p className="text-slate-600 dark:text-slate-400">Trung tâm thiết kế thời trang được khánh thành tại Hóc Môn với diện tích 18.000 m2.</p>
                </div>
                <div>
                  <span className="font-extrabold text-[#00BCD4] block">Năm 2016</span>
                  <p className="text-slate-600 dark:text-slate-400">Công ty Việt Tiến thay đổi diện mạo mới tại thị trường Việt Nam với hệ thống cửa hàng Viettien House.</p>
                </div>
              </div>
            </div>
          )
        };

      case 'overview':
        return {
          headerTitle: 'Tổng quan về thương hiệu',
          title: 'Tổng quan',
          subtitle: 'Thông tin chung và sứ mệnh của VTEC',
          icon: <LayoutGrid className="w-12 h-12 text-[#00BCD4]" />,
          imageSrc: MEDIA.overview, // Tem Hàng Việt Nam Chất Lượng Cao
          content: (
            <div className="space-y-4 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 p-4.5 rounded-2xl space-y-2">
                <p><strong className="text-slate-900 dark:text-white block text-sm">Tên tiếng Việt:</strong> Tổng công ty Cổ phần May Việt Tiến</p>
                <p><strong className="text-slate-900 dark:text-white block text-sm">Tên giao dịch quốc tế:</strong> VIETTIEN GARMENT CORPORATION</p>
                <p><strong className="text-slate-900 dark:text-white block text-sm">Tên viết tắt:</strong> VTEC</p>
              </div>

              <p className="font-medium text-slate-800 dark:text-slate-100">
                Tổng công ty Cổ phần May Việt Tiến được thành lập từ năm 1975. Với sứ mệnh không ngừng nâng cao sự hài lòng của khách hàng bằng những sản phẩm và dịch vụ tốt nhất, Việt Tiến hiện nay là một trong những doanh nghiệp dẫn đầu ngành dệt may Việt Nam với những giải thưởng danh giá như:
              </p>

              

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <div className="flex items-center gap-3 bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#2563EB]/10 p-3 rounded-xl">
                  <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Huân chương lao động hạng Nhất do Chính phủ trao tặng</span>
                </div>
                <div className="flex items-center gap-3 bg-[#ECFDF5] dark:bg-emerald-950/30 border border-[#10B981]/10 p-3 rounded-xl">
                  <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Hàng Việt Nam chất lượng cao 20 năm liên tục</span>
                </div>
                <div className="flex items-center gap-3 bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#F59E0B]/10 p-3 rounded-xl">
                  <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Top 10 nhãn hiệu nổi tiếng nhất Việt Nam</span>
                </div>
                <div className="flex items-center gap-3 bg-[#EEF2F6] dark:bg-slate-900/60 border border-slate-300/30 p-3 rounded-xl">
                  <span className="w-2.5 h-2.5 bg-slate-50 dark:bg-slate-900/600 rounded-full shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Top 10 doanh nghiệp được tín nhiệm nhất Việt Nam</span>
                </div>
              </div>
            </div>
          )
        };

      case 'achievements':
        return {
          headerTitle: 'Thành tựu đạt được',
          title: 'Thành tựu',
          subtitle: 'Thương hiệu Việt, chất lượng quốc tế',
          icon: <Trophy className="w-12 h-12 text-[#00BCD4]" />,
          imageSrc: MEDIA.achievement, // Cúp Thương hiệu Quốc gia 2024
          content: (
            <div className="space-y-4 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <p className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 pb-2">
                "Thương hiệu Việt, chất lượng quốc tế"
              </p>
              
              <p>
                Trong suốt quá trình hình thành và phát triển, Việt Tiến đã vinh dự nhận được rất nhiều chứng nhận, giải thưởng, cúp, bằng khen từ tổ chức, cơ quan trong và ngoài nước, điển hình như:
              </p>

              <div className="my-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <img
                  src={MEDIA.achievement}
                  alt="Chứng nhận Thương hiệu Quốc gia Việt Tiến"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/60 p-2 text-center uppercase tracking-wider border-t border-slate-100">
                  Bằng chứng nhận doanh nghiệp đạt Thương hiệu Quốc gia danh giá
                </p>
              </div>

              <div className="space-y-2 pt-2 text-slate-800 dark:text-slate-100 font-medium">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Chứng nhận Nhãn hiệu hàng đầu, Sản phẩm vàng, Dịch vụ vàng của Việt Nam</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Top 10 Sản phẩm Vàng Việt Nam</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Nhận được giải thưởng Hàng Việt Nam Chất lượng cao</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Chứng nhận Thương hiệu Quốc gia 20 năm liền</p>
                </div>

                <div className="my-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <img
                    src={MEDIA.banners[2]}
                    alt="Chứng chỉ ISO 9001:2015"
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/60 p-2 text-center uppercase tracking-wider border-t border-slate-100">
                    Hệ thống quản lý chất lượng đạt tiêu chuẩn quốc tế ISO 9001:2015
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Lọt Top 10 doanh nghiệp tín nhiệm nhất Việt Nam</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Chứng nhận Sản phẩm Công nghiệp hỗ trợ tiêu biểu</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl flex items-start gap-3">
                  <span className="text-[#00BCD4] mt-0.5">🏆</span>
                  <p>Lọt Top 10 Nhãn Hiệu Nổi tiếng nhất Việt Nam</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Các Danh Hiệu Cao Quý Khác:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Huân chương lao động hạng Nhất do Chính phủ trao tặng</li>
                  <li>Hàng Việt Nam chất lượng cao 20 năm liên tục</li>
                  <li>Top 10 nhãn hiệu nổi tiếng nhất Việt Nam</li>
                  <li>Top 10 doanh nghiệp được tín nhiệm nhất Việt Nam</li>
                </ul>
              </div>
            </div>
          )
        };

      case 'security':
        return {
          headerTitle: 'Thông tin bảo mật',
          title: 'Bảo Mật',
          subtitle: 'Việt Tiến – Việt Nam tiến lên',
          icon: <ShieldAlert className="w-12 h-12 text-[#00BCD4]" />,
          imageSrc: MEDIA.banners[4], // Ảnh bảo mật Việt Tiến từ logochua
          content: (
            <div className="space-y-4 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/50 p-4 rounded-xl text-red-700">
                <ShieldAlert className="w-6 h-6 shrink-0 animate-bounce" />
                <span className="font-extrabold text-sm">CẢNH BÁO GIẢ MẠO THƯƠNG HIỆU VIỆT TIẾN</span>
              </div>

              <p className="font-bold text-slate-900 dark:text-white pt-1">
                Kính gửi quý khách hàng!
              </p>
              
              <p>
                Gần đây có các trang Fanpage giả mạo thương hiệu <strong className="text-slate-900 dark:text-white">VIETTIEN</strong> đang hoạt động và đưa thông tin không chính xác, gây nhầm lẫn cho quý khách hàng, ảnh hưởng đến quyền lợi cũng như tâm lý của quý khách hàng.
              </p>

              <p className="bg-[#FFFEEF] dark:bg-amber-950/20 p-4.5 rounded-xl border border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-slate-100">
                Tổng Cty Cổ Phần May Việt Tiến xin thông báo, chúng tôi tuyển gia công cắt nhãn tại nhà nhưng các Fanpage giả mạo thông tin của công ty nhằm chuộc lợi, chiếm đoạt từ khách hàng.
              </p>

              <p className="font-medium">
                Đề nghị Quý khách hàng lưu ý để tránh bị nhầm lẫn và lợi dụng của các Fanpage giả mạo. Mọi thông tin chi tiết hãy liên hệ with hệ thống quản lý của công ty để tránh những rủi ro xảy ra !
              </p>
            </div>
          )
        };

      case 'trends':
        return {
          headerTitle: 'Xu hướng phát triển',
          title: 'Xu hướng',
          subtitle: 'VƯƠN XA TẦM QUỐC TẾ',
          icon: <Sparkles className="w-12 h-12 text-[#00BCD4]" />,
          imageSrc: MEDIA.banners[5], // Ảnh xu hướng Việt Tiến từ logochua
          content: (
            <div className="space-y-4 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="relative p-6 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md text-center">
                <span className="text-[10px] tracking-widest font-extrabold uppercase block bg-white/20 px-3 py-1 rounded-full w-fit mx-auto">BIG SALE 50%</span>
                <h4 className="text-lg font-black mt-2 leading-tight">Chất Lượng Khẳng Định Thương Hiệu</h4>
                <p className="text-[11px] text-white/90 mt-1">Từ 01/01 đến 01/02/2026 trên toàn quốc</p>
              </div>

              <p>
                Ngày nay, trang phục đã vượt xa ngoài ranh giới của vai trò che chắn cơ thể, trở thành ngôn ngữ diễn đạt của phong cách và góp phần không nhỏ trong sự thành công của chủ nhân. Nền tảng xã hội ngày càng đòi hỏi con người phải xây dựng hình ảnh chỉn chu và tinh tế hơn.
              </p>

              <div className="my-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <img
                  src={MEDIA.banners[5]}
                  alt="Văn phòng hiện đại của Việt Tiến"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
                <p className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/60 p-2 text-center uppercase tracking-wider border-t border-slate-100">
                  Tòa nhà văn phòng hiện đại với kiến trúc xanh tương lai của VTEC
                </p>
              </div>

              <p className="font-semibold text-slate-900 dark:text-white">
                Hiểu được điều đó, việt tiến – một thương hiệu có bề dày lịch sử và chiều sâu trong lĩnh vực tạo ra cái đẹp tại việt nam đã từng bước thay đổi để hoàn thành tốt sứ mệnh xây dựng phong cách trẻ trung, sang trọng, lịch lãm cho thượng đế của mình.
              </p>

              <p>
                Với trên 40 năm kinh nghiệm phát triển, hiện nay Việt Tiến đã vươn lên khẳng định vị thế một trong những thương hiệu thời trang công sở hàng đầu tại Việt Nam. Tuy nhiên trong bối cảnh cạnh tranh khốc liệt trên thị trường thời trang Việt, Việt Tiến không cho mình quyền tự thỏa mãn với những vinh quang đạt được mà phải đổi mới và nâng cấp không ngừng.
              </p>

              <p className="bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl text-slate-650 border border-slate-100">
                Đó cũng là lý do khiến thương hiệu may mặc nổi tiếng này vẫn đang ngày đêm nỗ lực sáng tạo thông qua việc mở rộng đa dạng hóa chủng loại sản phẩm, nâng cao sức cạnh tranh của sản phẩm; đồng thời tập trung phát triển hệ thống phân phối chuyên nghiệp nhằm mang đến sự tiện lợi và những trải nghiệm thú vị nhất cho khách hàng.
              </p>
            </div>
          )
        };
    }
  };

  const config = getScreenConfig();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-24 max-w-lg mx-auto bg-white dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* 1. Header Bar: Solid Cyan Bar with title and left aligned back arrow ← */}
      <div className="bg-[#00BCD4] text-white flex items-center justify-between px-4 h-14 shadow-sm select-none sticky top-0 z-50">
        <button
          onClick={() => setActiveScreen('home')}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          id="btn-back-to-home"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[16px] font-black uppercase text-center tracking-wider truncate mx-4 flex-grow text-center pr-6">
          {config.headerTitle}
        </h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* 2. Banner/Visual Image representing the sub-page */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 border-b border-slate-100 flex items-center justify-center">
        <img
          src={config.imageSrc}
          alt={config.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        
        {/* Absolute floating category label */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/25">
            {React.cloneElement(config.icon, { className: 'w-5 h-5 text-white' })}
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">{config.title}</h2>
            <p className="text-[10px] text-white/80 font-medium">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 3. Main Text Content Section */}
      <div className="px-5 py-6">
        {config.content}
      </div>

      {/* 4. Footer Brand Seal */}
      <div className="my-8 text-center opacity-40 px-6 space-y-1">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
          ỦY THÁC DỊCH VỤ TRUYỀN THÔNG SỐ VTEC
        </p>
        <p className="text-[9px] text-slate-400">
          Chất lượng khẳng định thương hiệu - Đồng hành phát triển cùng Việt Tiến
        </p>
      </div>

    </motion.div>
  );
};
