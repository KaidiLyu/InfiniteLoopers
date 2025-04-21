/**
 * InfiniteLoopers - AI-Powered Nutritional Search App
 * 主要JavaScript文件 - 处理网站的交互和功能
 * Main JavaScript file - Handles website interactions and functionality
 */

document.addEventListener("DOMContentLoaded", () => {
    // 语言切换功能 - Language Toggle
    const btnLanguage = document.querySelector(".btn-language")
    const btnLanguageMobile = document.querySelector(".btn-language-mobile")
    const languageIndicator = document.querySelector(".language-indicator")
    let currentLanguage = localStorage.getItem("language") || "en"
  
    // 设置初始语言 - Set initial language
    setLanguage(currentLanguage)
  
    // 语言切换按钮事件监听器 - Language toggle event listeners
    if (btnLanguage) {
      btnLanguage.addEventListener("click", toggleLanguage)
    }
  
    if (btnLanguageMobile) {
      btnLanguageMobile.addEventListener("click", toggleLanguage)
    }
  
    /**
     * 切换语言函数 - 在英文和中文之间切换
     * Toggle language function - Switch between English and Chinese
     */
    function toggleLanguage() {
      currentLanguage = currentLanguage === "en" ? "zh" : "en"
      localStorage.setItem("language", currentLanguage)
      setLanguage(currentLanguage)
    }
  
    /**
     * 设置语言函数 - 更新所有可翻译元素的文本
     * Set language function - Updates text for all translatable elements
     * @param {string} lang - 语言代码('en'或'zh') / Language code ('en' or 'zh')
     */
    function setLanguage(lang) {
      if (languageIndicator) {
        languageIndicator.textContent = lang.toUpperCase()
      }
  
      // 更新所有可翻译元素 - Update all translatable elements
      const elements = document.querySelectorAll("[data-i18n]")
      elements.forEach((el) => {
        const key = el.getAttribute("data-i18n")
        if (translations[lang] && translations[lang][key]) {
          el.textContent = translations[lang][key]
        }
      })
    }
  
    // 移动端菜单切换 - Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle")
    const mobileMenu = document.querySelector(".mobile-menu")
  
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("active")
  
        // 切换菜单图标 - Toggle menu icon
        const icon = menuToggle.querySelector("i")
        if (icon) {
          if (mobileMenu.classList.contains("active")) {
            icon.classList.remove("lucide-menu")
            icon.classList.add("lucide-x")
          } else {
            icon.classList.remove("lucide-x")
            icon.classList.add("lucide-menu")
          }
        }
      })
    }
  
    // 平滑滚动功能 - Smooth Scrolling
    const scrollLinks = document.querySelectorAll("[data-scroll-to]")
  
    scrollLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
        const targetId = this.getAttribute("data-scroll-to")
        const targetElement = document.getElementById(targetId)
  
        if (targetElement) {
          // 如果移动菜单打开，则关闭 - Close mobile menu if open
          if (mobileMenu && mobileMenu.classList.contains("active")) {
            mobileMenu.classList.remove("active")
            const icon = menuToggle.querySelector("i")
            if (icon) {
              icon.classList.remove("lucide-x")
              icon.classList.add("lucide-menu")
            }
          }
  
          // 滚动到目标位置 - Scroll to target
          const navbarHeight = document.querySelector(".navbar").offsetHeight
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight
  
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      })
    })
  
    // 模态框功能 - Modal Functionality
    const modals = document.querySelectorAll(".modal")
    const modalTriggers = {
      loginModal: [document.getElementById("loginBtn"), document.getElementById("loginBtnMobile")],
      downloadModal: [document.getElementById("downloadBtn"), document.getElementById("downloadBtnCta")],
    }
  
    // 设置模态框触发器 - Setup modal triggers
    for (const [modalId, triggers] of Object.entries(modalTriggers)) {
      const modal = document.getElementById(modalId)
  
      if (modal) {
        triggers.forEach((trigger) => {
          if (trigger) {
            trigger.addEventListener("click", () => {
              modal.classList.add("active")
            })
          }
        })
  
        // 通过关闭按钮关闭模态框 - Close modal with close button
        const closeBtn = modal.querySelector(".modal-close")
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            modal.classList.remove("active")
          })
        }
  
        // 点击模态框外部关闭模态框 - Close modal when clicking outside
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.remove("active")
          }
        })
      }
    }
  
    // 登录表单处理 - Login Form Handling
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
  
        console.log("Login attempt with:", email, password)
        // 这里通常会将数据发送到服务器 - Here you would typically send the data to a server
  
        // 提交后关闭模态框 - Close the modal after submission
        const modal = document.getElementById("loginModal")
        if (modal) {
          modal.classList.remove("active")
        }
      })
    }
  
    // 标签页功能 - Tab Functionality
    const tabButtons = document.querySelectorAll(".tab-btn")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab")
        const tabContainer = this.closest(".download-tabs, .info-tabs")
  
        if (tabContainer) {
          // 停用所有标签页 - Deactivate all tabs
          const allTabs = tabContainer.querySelectorAll(".tab-pane")
          const allButtons = tabContainer.querySelectorAll(".tab-btn")
  
          allTabs.forEach((tab) => tab.classList.remove("active"))
          allButtons.forEach((btn) => btn.classList.remove("active"))
  
          // 激活选中的标签页 - Activate selected tab
          this.classList.add("active")
          const selectedTab = document.getElementById(`${tabId}-tab`)
          if (selectedTab) {
            selectedTab.classList.add("active")
          }
        }
      })
    })
  
    // 视频播放器功能 - Video Player Functionality
    const videoElement = document.getElementById("demoVideo")
    const videoPlayBtn = document.querySelector(".video-play-btn")
    const videoOverlay = document.querySelector(".video-overlay")
  
    if (videoElement && videoPlayBtn && videoOverlay) {
      videoPlayBtn.addEventListener("click", toggleVideo)
  
      // 当视频自己暂停或播放时也更新覆盖层状态
      videoElement.addEventListener("play", function() {
        videoOverlay.style.opacity = "0"
        videoOverlay.style.pointerEvents = "none"
        videoPlayBtn.innerHTML = '<i class="lucide lucide-pause"></i>'
      })
  
      videoElement.addEventListener("pause", function() {
        videoOverlay.style.opacity = "1"
        videoOverlay.style.pointerEvents = "auto"
        videoPlayBtn.innerHTML = '<i class="lucide lucide-play"></i>'
      })
  
      /**
       * 切换视频播放/暂停状态
       * Toggle video play/pause state
       */
      function toggleVideo() {
        if (videoElement.paused) {
          videoElement.play()
          videoOverlay.style.opacity = "0"
          videoOverlay.style.pointerEvents = "none"
          videoPlayBtn.innerHTML = '<i class="lucide lucide-pause"></i>'
        } else {
          videoElement.pause()
          videoOverlay.style.opacity = "1"
          videoOverlay.style.pointerEvents = "auto"
          videoPlayBtn.innerHTML = '<i class="lucide lucide-play"></i>'
        }
      }
  
      // 当滚动到视图中时自动播放视频 - Auto-play video when scrolled into view
      const videoSection = document.querySelector(".video-section")
      if (videoSection) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && videoElement.paused) {
                // 当视频进入视图时尝试播放 - Try to play video when it comes into view
                videoElement
                  .play()
                  .then(() => {
                    videoOverlay.style.opacity = "0"
                    videoOverlay.style.pointerEvents = "none"
                    videoPlayBtn.innerHTML = '<i class="lucide lucide-pause"></i>'
                  })
                  .catch((error) => {
                    console.error("Video play failed:", error)
                    // 如果自动播放失败(在移动设备上常见)，保持叠加层可见 - Keep overlay visible if autoplay fails (common on mobile)
                  })
              } else if (!entry.isIntersecting && !videoElement.paused) {
                videoElement.pause()
                videoOverlay.style.opacity = "1"
                videoOverlay.style.pointerEvents = "auto"
                videoPlayBtn.innerHTML = '<i class="lucide lucide-play"></i>'
              }
            })
          },
          { threshold: 0.5 },
        )
  
        observer.observe(videoSection)
      }
    }
  })
  
  /**
   * 翻译内容 - 包含英文和中文两种语言的所有界面文本
   * Translations - Contains all interface text in both English and Chinese
   */
  const translations = {
    en: {
      // Navbar
      features: "Features",
      howItWorks: "How It Works",
      team: "Team",
      login: "Login",
  
      // Hero Section
      heroTitle: "AI-Powered Nutritional Search",
      heroSubtitle:
        "Discover the nutritional content of any food with just a photo or text search, powered by advanced AI.",
      downloadNow: "Download Now",
      learnMore: "Learn More",
  
      // Features Section
      featuresTitle: "Key Features",
      feature1Title: "Image Recognition",
      feature1Description: "Take a photo of any food and get instant nutritional information.",
      feature2Title: "Natural Language Search",
      feature2Description: "Simply describe the food you're looking for in natural language.",
      feature3Title: "Comprehensive Data",
      feature3Description: "Get detailed nutritional breakdown including calories, macros, vitamins, and more.",
  
      // How it Works Section
      howItWorksTitle: "How It Works",
      step1: "Take a photo or enter a description",
      step2: "Our AI analyzes the content",
      step3: "Get detailed nutritional information",
      step4: "Make informed dietary choices",
  
      // Team Section
      teamTitle: "Meet Our Team",
      teamDescription: "The brilliant minds behind InfiniteLoopers",
  
      // CTA Section
      ctaTitle: "Ready to Transform Your Nutrition?",
      ctaSubtitle: "Download our app today and start making smarter food choices.",
      downloadApp: "Download App",
  
      // Footer
      copyright: "© 2025 InfiniteLoopers. All rights reserved.",
  
      // Video Section
      videoTitle: "See It In Action",
      videoSubtitle: "Watch how our app works in real time",
  
      // QR Code Modal
      scanToDownload: "Scan QR Code to Download",
      downloadOptions: "Download Options",
      downloadAndroid: "Download for Android",
      downloadIOS: "Download for iOS",
      closeModal: "Close",
  
      // Learn More Page
      backToHome: "Back to Home",
      learnMoreTitle: "Discover InfiniteLoopers",
      learnMoreDescription1:
        "InfiniteLoopers Nutritional Search App is an AI-powered mobile application that allows users to search for food items and receive comprehensive nutritional information instantly.",
      learnMoreDescription2:
        "Using advanced image recognition and natural language processing, our app helps users make informed choices about their diet with just a few taps.",
      learnMoreDescription3:
        "Our mission is to simplify the process of tracking nutrition. Instead of manually searching databases or guessing nutritional content, users can simply snap a photo of their meal or describe it in natural language. The app will identify the food items and provide detailed nutritional breakdown, helping users maintain healthier eating habits.",
      learnMoreDescription4:
        "Developed by a team of passionate students from the University of South Carolina, the InfiniteLoopers app combines cutting-edge AI technology with a user-friendly interface to make nutritional information accessible to everyone. Whether you're counting calories, tracking macros, or just curious about what's in your food, our app has you covered.",
      learnMoreDescription5:
        "The app features real-time nutrition tracking, personalized recommendations based on dietary goals, and a comprehensive food database that is constantly expanding. Users can save their favorite meals, track their daily intake, and receive insights about their eating patterns over time.",
      viewGitHub: "View on GitHub",
      detailedFeatures: "Features",
      technicalInfo: "Technical Info",
      aboutTeam: "Team",
      feature1Detail: "Advanced image recognition identifies food items from photos with high accuracy",
      feature2Detail: "Natural language processing understands complex food queries",
      feature3Detail: "Comprehensive nutritional database covering thousands of food items",
      feature4Detail: "Personalized recommendations based on your dietary preferences",
      feature5Detail: "Multi-platform application built with React Native and Expo for seamless experience across devices",
      feature6Detail: "Real-time nutritional information display with detailed macronutrient breakdown",
      feature7Detail: "Barcode scanning capability for quick packaged food identification",
      feature8Detail: "Daily calorie and nutrition tracking with progress visualization",
      feature9Detail: "Meal history saving feature for frequently consumed foods",
      feature10Detail: "Export nutrition data to track your health journey over time",
      feature11Detail: "Privacy-focused design that keeps your dietary information secure",
      techStack: "Technology Stack",
      aiModels: "AI Models",
      aiModelsDetail: "Custom-trained image recognition and NLP models",
      dataProcessing: "Data Processing",
      dataProcessingDetail: "Real-time data analysis with edge computing for fast results",
      apiIntegration: "API Integration",
      apiIntegrationDetail: "Integrated with comprehensive nutritional databases",
      frontendArch: "Frontend Architecture",
      frontendArchDetail: "Component-based architecture with React Hooks for state management",
      backendServices: "Backend Services",
      backendServicesDetail: "Firebase for authentication, real-time database, and cloud functions",
      mobileFeatures: "Mobile Features",
      mobileFeaturesDetail: "Native camera access, barcode scanning, and push notifications",
      performanceOpt: "Performance Optimization",
      performanceOptDetail: "Lazy loading components and efficient caching strategies for fast app response",
      testingFramework: "Testing Framework",
      testingFrameworkDetail: "Jest and React Testing Library for unit and component testing",
      cicdPipeline: "CI/CD Pipeline",
      cicdPipelineDetail: "Automated testing and deployment using GitHub Actions",
      crossPlatform: "Cross-Platform Compatibility",
      crossPlatformDetail: "Optimized for both iOS and Android platforms with platform-specific adaptations",
      teamDescription: "Our team consists of five passionate developers from the University of South Carolina who are dedicated to making nutritional information more accessible.",
      teamDescription2: "The InfiniteLoopers team was formed as part of the Capstone Project at the University of South Carolina's Computer Science program. Each member brings unique skills and perspectives to the project, collaborating closely to build an application that addresses real-world nutritional tracking needs.",
      teamDescription3: "Our development process follows Agile methodologies, with regular sprint planning and review meetings to ensure continuous improvement. We maintain a strong focus on user experience, performance optimization, and code quality throughout the development lifecycle.",
      teamDescription4: "The team is committed to creating technology that makes a positive impact on users' health and wellbeing. We believe that access to accurate nutritional information should be simple, fast, and available to everyone, regardless of their technical expertise.",
      role1: "Project Manager & Frontend Developer",
      role2: "AI Implementation Specialist",
      role3: "Backend Developer",
      role4: "UI/UX Designer",
      role5: "Quality Assurance Engineer"
    },
    zh: {
      // 导航栏 (Navbar)
      features: "功能特点",
      howItWorks: "工作原理",
      team: "团队",
      login: "登录",
  
      // 英雄区域 (Hero Section)
      heroTitle: "AI驱动的营养搜索",
      heroSubtitle: "通过照片或文字搜索，借助先进的AI技术，发现任何食物的营养成分。",
      downloadNow: "立即下载",
      learnMore: "了解更多",
  
      // 功能区域 (Features Section)
      featuresTitle: "核心功能",
      feature1Title: "图像识别",
      feature1Description: "拍摄任何食物的照片，获取即时营养信息。",
      feature2Title: "自然语言搜索",
      feature2Description: "只需用自然语言描述您要查找的食物。",
      feature3Title: "全面数据",
      feature3Description: "获取详细的营养分析，包括卡路里、宏量营养素、维生素等。",
  
      // 工作原理区域 (How it Works Section)
      howItWorksTitle: "工作原理",
      step1: "拍照或输入描述",
      step2: "AI分析内容",
      step3: "获取详细营养信息",
      step4: "做出明智的饮食选择",
  
      // 团队区域 (Team Section)
      teamTitle: "团队成员",
      teamDescription: "InfiniteLoopers背后的优秀团队",
  
      // 行动召唤区域 (CTA Section)
      ctaTitle: "准备改变您的营养方式？",
      ctaSubtitle: "今天就下载我们的应用，开始做出更明智的食物选择。",
      downloadApp: "下载应用",
  
      // 页脚 (Footer)
      copyright: "© 2025 InfiniteLoopers. 保留所有权利。",
  
      // 视频区域 (Video Section)
      videoTitle: "实际操作演示",
      videoSubtitle: "观看我们的应用实时工作",
  
      // 二维码模态框 (QR Code Modal)
      scanToDownload: "扫描二维码下载",
      downloadOptions: "下载选项",
      downloadAndroid: "下载安卓版",
      downloadIOS: "下载iOS版",
      closeModal: "关闭",
  
      // 了解更多页面 (Learn More Page)
      backToHome: "返回首页",
      learnMoreTitle: "探索 InfiniteLoopers",
      learnMoreDescription1:
        "InfiniteLoopers营养搜索应用是一款AI驱动的移动应用，允许用户搜索食品项目并立即获取全面的营养信息。",
      learnMoreDescription2:
        "通过先进的图像识别和自然语言处理技术，我们的应用帮助用户只需几次点击即可对饮食做出明智的选择。",
      learnMoreDescription3:
        "我们的使命是简化营养跟踪过程。用户无需手动搜索数据库或猜测营养成分，只需拍摄餐食照片或用自然语言描述即可。应用将识别食物并提供详细的营养分析，帮助用户保持更健康的饮食习惯。",
      learnMoreDescription4:
        "由南卡罗来纳大学热情的学生团队开发，InfiniteLoopers应用结合了前沿AI技术与用户友好的界面，使营养信息对每个人都触手可及。无论您是在计算卡路里、追踪宏量营养素，还是只是好奇食物中的成分，我们的应用都能满足您的需求。",
      learnMoreDescription5:
        "该应用具有实时营养跟踪、基于饮食目标的个性化推荐以及不断扩展的综合食物数据库功能。用户可以保存喜爱的餐食，跟踪每日摄入量，并随时间获取有关饮食模式的见解。",
      viewGitHub: "在GitHub上查看",
      detailedFeatures: "功能详情",
      technicalInfo: "技术信息",
      aboutTeam: "关于团队",
      feature1Detail: "先进的图像识别技术可以高精度识别照片中的食物",
      feature2Detail: "自然语言处理理解复杂的食物查询",
      feature3Detail: "全面的营养数据库覆盖数千种食物",
      feature4Detail: "基于您的饮食偏好提供个性化推荐",
      feature5Detail: "使用React Native和Expo构建的多平台应用，可在各种设备上提供无缝体验",
      feature6Detail: "实时显示营养信息，包含详细的宏量营养素分析",
      feature7Detail: "条形码扫描功能，可快速识别包装食品",
      feature8Detail: "每日卡路里和营养跟踪，带有进度可视化功能",
      feature9Detail: "餐食历史保存功能，方便记录常吃的食物",
      feature10Detail: "导出营养数据功能，帮助您随时间跟踪健康旅程",
      feature11Detail: "注重隐私的设计，确保您的饮食信息安全",
      techStack: "技术栈",
      aiModels: "AI模型",
      aiModelsDetail: "定制训练的图像识别和NLP模型",
      dataProcessing: "数据处理",
      dataProcessingDetail: "使用边缘计算进行实时数据分析，以获得快速结果",
      apiIntegration: "API集成",
      apiIntegrationDetail: "与全面的营养数据库集成",
      frontendArch: "前端架构",
      frontendArchDetail: "基于组件的架构，使用React Hooks进行状态管理",
      backendServices: "后端服务",
      backendServicesDetail: "使用Firebase进行身份验证、实时数据库和云函数",
      mobileFeatures: "移动特性",
      mobileFeaturesDetail: "原生相机访问、条形码扫描和推送通知",
      performanceOpt: "性能优化",
      performanceOptDetail: "懒加载组件和高效缓存策略，确保应用快速响应",
      testingFramework: "测试框架",
      testingFrameworkDetail: "Jest和React Testing Library进行单元和组件测试",
      cicdPipeline: "CI/CD流程",
      cicdPipelineDetail: "使用GitHub Actions进行自动化测试和部署",
      crossPlatform: "跨平台兼容性",
      crossPlatformDetail: "针对iOS和Android平台进行优化，包含平台特定的适配",
      teamDescription: "我们的团队由来自南卡罗来纳大学的五位充满热情的开发人员组成，他们致力于使营养信息更加易于获取。",
      teamDescription2: "InfiniteLoopers团队是南卡罗来纳大学计算机科学专业毕业设计项目的一部分。每位成员都为项目带来独特的技能和视角，紧密合作，构建解决现实世界营养跟踪需求的应用。",
      teamDescription3: "我们的开发过程遵循敏捷方法论，定期进行冲刺规划和评审会议，确保持续改进。在整个开发生命周期中，我们始终注重用户体验、性能优化和代码质量。",
      teamDescription4: "团队致力于创造对用户健康和福祉产生积极影响的技术。我们相信，获取准确的营养信息应该简单、快速，并且对所有人开放，无论他们的技术专长如何。",
      role1: "项目经理 & 前端开发",
      role2: "AI实现专家",
      role3: "后端开发",
      role4: "UI/UX设计师",
      role5: "质量保证工程师"
    },
  }
  
  
