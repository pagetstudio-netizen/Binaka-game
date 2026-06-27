import { motion } from "framer-motion";

import banner1 from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547259143.png";
import banner2 from "@assets/file_000000000f0471f4a3199220c69af3b7_1782547259216.png";
import banner3 from "@assets/1c02ab26-f0bd-40a1-bb0d-c4aaadf65c82_1782547299433.png";
import promo1 from "@assets/20260624_150018_1782317841294.png";
import promo2 from "@assets/20260624_150106_1782317841320.png";
import promo3 from "@assets/20260624_150241_1782317841340.png";
import promo4 from "@assets/20260624_150402_1782317841358.png";
import promo5 from "@assets/20260624_150441_1782317841381.png";
import promo6 from "@assets/file_000000005a0c71f4bc093c66523e7c21_1782512298304.png";
import promo7 from "@assets/file_0000000083c071f4a1b9b5b3e1dd86cd_1782512584552.png";

const BANNERS = [
  banner1,
  banner2,
  banner3,
  promo1,
  promo2,
  promo3,
  promo4,
  promo5,
  promo6,
  promo7,
];

export default function Promotions() {
  return (
    <div className="flex flex-col w-full min-h-full bg-gray-100 pb-24">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-4 h-14 flex items-center">
        <h1 className="text-xl font-black text-gray-900">Promotions</h1>
      </header>

      <div className="flex flex-col gap-3 p-3">
        {BANNERS.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
            className="w-full rounded-2xl overflow-hidden shadow-md bg-white"
          >
            <img
              src={src}
              alt={`Promotion ${i + 1}`}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
