import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import spaghettiImg from "../../assets/HeroBild/spaghetti.png";
import kiLogoImg from "../../assets/HeroBild/ki-logo.png";
import teppichImg from "../../assets/HeroBild/teppich.png";
import "./HeroBild.css";

type Product = {
  name: string;
  img: string;
};

const productsList: Product[] = [
  { name: "teppich", img: teppichImg },
  { name: "spaghetti", img: spaghettiImg },
  /*{ name: "Морковь", img: carrotImg },
  { name: "Орехи", img: nutsImg },*/
];

const finalPositions = [
  { x: 150, y: 100 },
  { x: 170, y: 120 },
  { x: 150, y: 100 },
  { x: 150, y: 400 },
  { x: 150, y: 400 },
];

export default function HeroBild() {
  const [flyingProducts, setFlyingProducts] = useState<Product[]>([]);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    productsList.forEach((p, index) => {
      const timeout = window.setTimeout(() => {
        setFlyingProducts((prev) => [...prev, p]);
      }, index * 10);
      timeouts.current.push(timeout);
    });

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="container max-xl:hidden">
      {flyingProducts.map((product, i) => (
        <motion.img
          key={product.name}
          src={product.img}
          alt={product.name}
          className={`product ${product.name}`}
          initial={{
            x: Math.random() * 300,
            y: -120,
            opacity: 0,
            scale: 1,
          }}
          animate={{
            x: finalPositions[i]?.x || 0,
            y: finalPositions[i]?.y || 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            /*ease: [0.4, 0, 0.2, 1],*/
            type: "spring",
            stiffness: 50,
            damping: 7,
          }}
        />
      ))}
    </div>
  );
}
