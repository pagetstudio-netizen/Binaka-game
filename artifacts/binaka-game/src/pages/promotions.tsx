import { motion } from "framer-motion";

import banner1 from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547259143.png";
import banner2 from "@assets/file_000000000f0471f4a3199220c69af3b7_1782547259216.png";
import banner3 from "@assets/1c02ab26-f0bd-40a1-bb0d-c4aaadf65c82_1782547299433.png";

const BANNERS = [banner1, banner2, banner3];

export default function Promotions() {
  return (
    <div className="flex flex-col w-full min-h-full pb-24" style={{ background: "#071C12" }}>

      <div className="flex flex-col gap-3 p-3">
        {BANNERS.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="w-full rounded-2xl overflow-hidden shadow-md"
            style={{ background: "#0D2B1E" }}
          >
            <img
              src={src}
              alt={`Promotion ${i + 1}`}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 gap-2"
          style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
        >
          <span className="text-4xl">🎁</span>
          <p className="text-sm font-black" style={{ color: "rgba(255,255,255,0.55)" }}>D'autres promotions arrivent bientôt</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Revenez régulièrement !</p>
        </motion.div>
      </div>
    </div>
  );
}
