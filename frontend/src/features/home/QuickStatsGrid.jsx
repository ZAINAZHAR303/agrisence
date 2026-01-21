"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HiChartBar, HiCamera, HiClock } from "react-icons/hi";

export const QuickStatsGrid = () => {
  const stats = [
    {
      icon: HiChartBar,
      title: "Live Monitoring",
      description: "Track soil metrics in real-time",
      color: "from-emerald-500 to-green-500",
      href: "/soil-monitor",
    },
    {
      icon: HiCamera,
      title: "Disease Detection",
      description: "AI-powered plant disease identification",
      color: "from-blue-500 to-cyan-500",
      href: "/disease-detection",
    },
    {
      icon: HiClock,
      title: "Smart Irrigation",
      description: "Optimal watering schedules",
      color: "from-purple-500 to-pink-500",
      href: "/dashboard",
    },
    {
      icon: HiChartBar,
      title: "Analytics",
      description: "Comprehensive farm insights",
      color: "from-orange-500 to-red-500",
      href: "/dashboard",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to optimize your farm operations
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link href={stat.href}>
                  <div className="h-full p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {stat.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
