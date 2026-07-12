/**
 * Đường dẫn ảnh thương hiệu do khách hàng cung cấp.
 * Các file này nằm sẵn trong public_html/assets/images/... nên tham chiếu theo
 * đường dẫn tuyệt đối (được phục vụ ở gốc domain) thay vì import qua Vite.
 */
export const MEDIA = {
  // Logo VTEC / viettien (trang khách hàng, header, đăng nhập)
  logo: '/assets/images/logochua/62f3b886-a440-4315-927f-1b510c2f8951.jpg',

  // 6 ảnh banner carousel (trụ sở, sự kiện, biển hiệu, logo bảo mật, xu hướng)
  banners: [
    '/assets/images/banner/bf9ee668-1d0d-40e1-bca4-82734773f543.jpg', // trụ sở + trời xanh
    '/assets/images/banner/1b6fe92c-0b6a-46af-9166-cc187cc2bfce.jpg', // toà nhà kính viettien
    '/assets/images/banner/4a43cde9-f4a1-47c3-ac27-2b339913a92e.jpg', // hội nghị SXKD 2024
    '/assets/images/banner/f7c45cc2-56b1-4542-a684-3128942e0210.jpg', // biển đá công ty
    '/assets/images/logochua/1.jpg', // Bảo Mật
    '/assets/images/logochua/2.jpg', // Xu hướng
  ],

  // Tem "Hàng Việt Nam Chất Lượng Cao" (mục Tổng quan / khối chất lượng)
  overview: '/assets/images/logo/cf3a1440-7608-4a11-8eab-16cbd711bc6a.jpg',

  // Cúp "Thương hiệu Quốc gia 2024" (mục Thành tựu)
  achievement: '/assets/images/thanhtuu/bfe6a5a7-090d-4fa6-8e63-808b87ab1c28.jpg',
};
