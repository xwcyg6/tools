'use client';

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { 
  // 常用图标
  faHeart, faStar, faHome, faUser, faEnvelope, faPhone, faShoppingCart, faPlay,
  faMusic, faCamera, faGift, faCheck, faBookmark, faCoffee, faGamepad, faBell,
  faSearch, faDownload, faUpload, faShare, faCog, faThumbsUp, faThumbsDown,
  faFire, faEye, faEyeSlash, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash,
  
  // 商务图标
  faChartBar, faFile, faFolder, faCogs, faWrench, faRocket, faLightbulb,
  faDatabase, faCode, faBug, faEdit, faCopy, faTrash, faSave, faPrint,
  faBriefcase, faBuilding, faIndustry, faHandshake, faMoneyBill, faCreditCard,
  faChartLine, faChartPie, faCalculator, faClipboard, faFileAlt, faFilePdf,
  faFileWord, faFileExcel, faFilePowerpoint, faFileImage, faFileVideo, faFileAudio,
  
  // 科技图标
  faCloud, faServer, faLaptop, faDesktop, faMobile, faTablet,
  faShieldAlt, faLock, faKey, faGlobe, faWifi, 
  faHdd, faSdCard, faMemory, faBatteryFull, faBatteryHalf, faBatteryEmpty,
  faPlug, faPowerOff, faSignal, faRss, faQrcode,
  
  // 社交图标
  faUsers, faUserFriends, faUserPlus, faUserMinus, faComments, faComment,
  faCommentDots, faReply, faRetweet, faHashtag, faAt, faQuoteLeft, faQuoteRight,
  faPaperPlane, faInbox, faEnvelopeOpen, faEnvelopeOpenText, faAddressBook,
  faIdCard, faIdBadge, faUserTag, faUserCheck, faUserTimes,
  
  // 界面图标
  faPlus, faMinus, faTimes, faArrowRight, faArrowLeft, faArrowUp, faArrowDown,
  faSync, faRedo, faUndo, faRefresh, faExpand, faCompress, faMaximize, faMinimize,
  faAngleUp, faAngleDown, faAngleLeft, faAngleRight, faChevronUp, faChevronDown,
  faChevronLeft, faChevronRight, faCaretUp, faCaretDown, faCaretLeft, faCaretRight,
  faSort, faSortUp, faSortDown, faFilter, faBars, faEllipsisH, faEllipsisV,
  faGripHorizontal, faGripVertical, faGripLines, faGripLinesVertical,
  
  // 媒体图标
  faPause, faStop, faStepForward, faStepBackward, faFastForward, faFastBackward,
  faRandom, faRepeat, faVolumeDown, faVolumeOff, faHeadphones,
  faVideo, faVideoSlash, faImage, faImages, faPhotoVideo, faFilm,
  faCameraRetro, faRecordVinyl, faCompactDisc, faTv, faRadio, faPodcast,
  
  // 交通出行
  faCar, faTruck, faBus, faTaxi, faMotorcycle, faBicycle, faPlane, faTrain,
  faShip, faSubway, faWalking, faRunning, faMapMarkerAlt, faMap, faRoute,
  faCompass, faLocationArrow, faStreetView, faRoad, faParking, faGasPump,
  
  // 购物电商
  faShoppingBag, faShoppingBasket, faStoreAlt, faStore, faReceipt, faBarcode,
  faTags, faPercent, faGem, faCrown, faAward, faMedal, faTrophy, faRibbon,
  faGifts, faBox, faBoxOpen, faBoxes, faWarehouse, faShippingFast,
  
  // 健康医疗
  faHeart as faHeartSolid, faHeartbeat, faStethoscope, faUserMd, faHospital,
  faAmbulance, faPills, faSyringe, faThermometer, faBandAid, faFirstAid,
  faDna, faMicroscope, faXRay, faTeeth, faEye as faEyeMedical, faBrain,
  
  // 食物饮料
  faUtensils, faUtensilSpoon, faCocktail, faWineGlass,
  faBeer, faPizzaSlice, faHamburger, faHotdog, faIceCream, faCake,
  faAppleAlt, faCarrot, faCheese, faFish, faEgg, faBacon, faBreadSlice,
  
  // 运动休闲
  faFutbol, faBasketballBall, faBaseballBall, faFootballBall, faVolleyballBall,
  faTableTennis, faGolfBall, faBowlingBall, faHockeyPuck, faDumbbell,
  faSwimmer, faSkiing, faBiking, faHiking, faCampground,
  
  // 天气自然
  faSun, faMoon, faCloudSun, faCloudMoon, faCloudRain, faCloudShowersHeavy,
  faSnowflake, faBolt, faWind, faTemperatureHigh, faTemperatureLow,
  faTree, faLeaf, faSeedling, faMountain, faWater, faFire as faFireWeather,
  
  // 时间日期
  faCalendar, faCalendarAlt, faCalendarCheck, faCalendarTimes, faCalendarPlus,
  faClock, faStopwatch, faHourglass, faHourglassHalf, faHistory,
  faBusinessTime, faCalendarWeek, faCalendarDay,
  
  // 安全保护
  faShield, faShieldVirus, faUserShield, faLockOpen,
  faUnlock, faKeyboard, faFingerprint, faEyeDropper, faMask, faHardHat,
  faLifeRing, faExclamationTriangle, faInfoCircle, faQuestionCircle,
  
  // 文件格式
  faFileCode, faFileArchive, faFileContract, faFileInvoice, faFileSignature, 
  faFileDownload, faFileUpload, faFileImport, faFileExport, faFileCsv, faFileText
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/context/LanguageContext';

// 图标数据定义
interface IconCategory {
  key: string;
  name: string;
  icons: IconDefinition[];
}

const iconCategories: IconCategory[] = [
  {
    key: 'popular',
    name: 'popular_icons',
    icons: [
      faHeart, faStar, faHome, faUser, faEnvelope, faPhone, faShoppingCart, faPlay,
      faMusic, faCamera, faGift, faCheck, faBookmark, faCoffee, faGamepad, faBell,
      faSearch, faDownload, faUpload, faShare, faCog, faThumbsUp, faThumbsDown,
      faFire, faEye, faEyeSlash, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash
    ]
  },
  {
    key: 'business',
    name: 'business_icons', 
    icons: [
      faChartBar, faFile, faFolder, faCogs, faWrench, faRocket, faLightbulb,
      faDatabase, faCode, faBug, faEdit, faCopy, faTrash, faSave, faPrint,
      faBriefcase, faBuilding, faIndustry, faHandshake, faMoneyBill, faCreditCard,
      faChartLine, faChartPie, faCalculator, faClipboard, faFileAlt, faFilePdf,
      faFileWord, faFileExcel, faFilePowerpoint, faFileImage, faFileVideo, faFileAudio
    ]
  },
  {
    key: 'tech',
    name: 'tech_icons',
    icons: [
      faCloud, faDatabase, faServer, faLaptop, faDesktop, faMobile, faTablet,
      faShieldAlt, faLock, faKey, faGlobe, faWifi, 
      faHdd, faSdCard, faMemory, faBatteryFull, faBatteryHalf, faBatteryEmpty,
      faPlug, faPowerOff, faSignal, faRss, faQrcode,
      faCode, faBug, faWrench, faDownload, faUpload
    ]
  },
  {
    key: 'social',
    name: 'social_icons',
    icons: [
      faUsers, faUserFriends, faUserPlus, faUserMinus, faComments, faComment,
      faCommentDots, faReply, faRetweet, faHashtag, faAt, faQuoteLeft, faQuoteRight,
      faPaperPlane, faInbox, faEnvelopeOpen, faEnvelopeOpenText, faAddressBook,
      faIdCard, faIdBadge, faUserTag, faUserCheck, faUserTimes,
      faUser, faEnvelope, faPhone, faHeart, faShare, faBell
    ]
  },
  {
    key: 'ui',
    name: 'ui_icons',
    icons: [
      faPlus, faMinus, faTimes, faArrowRight, faArrowLeft, faArrowUp, faArrowDown,
      faSync, faRedo, faUndo, faRefresh, faExpand, faCompress, faMaximize, faMinimize,
      faAngleUp, faAngleDown, faAngleLeft, faAngleRight, faChevronUp, faChevronDown,
      faChevronLeft, faChevronRight, faCaretUp, faCaretDown, faCaretLeft, faCaretRight,
      faSort, faSortUp, faSortDown, faFilter, faBars, faEllipsisH, faEllipsisV,
      faGripHorizontal, faGripVertical, faGripLines, faGripLinesVertical,
      faSearch, faCog, faCheck
    ]
  },
  {
    key: 'media',
    name: 'media_icons',
    icons: [
      faPlay, faPause, faStop, faStepForward, faStepBackward, faFastForward, faFastBackward,
      faRandom, faRepeat, faVolumeDown, faVolumeOff, faHeadphones,
      faVideo, faVideoSlash, faImage, faImages, faPhotoVideo, faFilm,
      faCameraRetro, faRecordVinyl, faCompactDisc, faTv, faRadio, faPodcast,
      faMusic, faCamera, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash
    ]
  },
  {
    key: 'transport',
    name: 'transport_icons',
    icons: [
      faCar, faTruck, faBus, faTaxi, faMotorcycle, faBicycle, faPlane, faTrain,
      faShip, faSubway, faWalking, faRunning, faMapMarkerAlt, faMap, faRoute,
      faCompass, faLocationArrow, faStreetView, faRoad, faParking, faGasPump
    ]
  },
  {
    key: 'shopping',
    name: 'shopping_icons',
    icons: [
      faShoppingCart, faShoppingBag, faShoppingBasket, faStoreAlt, faStore, faReceipt, faBarcode,
      faTags, faPercent, faGem, faCrown, faAward, faMedal, faTrophy, faRibbon,
      faGifts, faBox, faBoxOpen, faBoxes, faWarehouse, faShippingFast,
      faMoneyBill, faCreditCard, faGift
    ]
  },
  {
    key: 'health',
    name: 'health_icons',
    icons: [
      faHeartSolid, faHeartbeat, faStethoscope, faUserMd, faHospital,
      faAmbulance, faPills, faSyringe, faThermometer, faBandAid, faFirstAid,
      faDna, faMicroscope, faXRay, faTeeth, faEyeMedical, faBrain
    ]
  },
  {
    key: 'food',
    name: 'food_icons',
    icons: [
      faUtensils, faUtensilSpoon, faCocktail, faWineGlass,
      faBeer, faPizzaSlice, faHamburger, faHotdog, faIceCream, faCake,
      faAppleAlt, faCarrot, faCheese, faFish, faEgg, faBacon, faBreadSlice, faCoffee
    ]
  },
  {
    key: 'sports',
    name: 'sports_icons',
    icons: [
      faFutbol, faBasketballBall, faBaseballBall, faFootballBall, faVolleyballBall,
      faTableTennis, faGolfBall, faBowlingBall, faHockeyPuck, faDumbbell,
      faSwimmer, faSkiing, faBiking, faHiking, faCampground
    ]
  },
  {
    key: 'weather',
    name: 'weather_icons',
    icons: [
      faSun, faMoon, faCloudSun, faCloudMoon, faCloudRain, faCloudShowersHeavy,
      faSnowflake, faBolt, faWind, faTemperatureHigh, faTemperatureLow,
      faTree, faLeaf, faSeedling, faMountain, faWater, faFireWeather, faCloud
    ]
  },
  {
    key: 'time',
    name: 'time_icons',
    icons: [
      faCalendar, faCalendarAlt, faCalendarCheck, faCalendarTimes, faCalendarPlus,
      faClock, faStopwatch, faHourglass, faHourglassHalf, faHistory,
      faBusinessTime, faCalendarWeek, faCalendarDay
    ]
  },
  {
    key: 'security',
    name: 'security_icons',
    icons: [
      faShield, faShieldVirus, faUserShield, faLockOpen,
      faUnlock, faKeyboard, faFingerprint, faEyeDropper, faMask, faHardHat,
      faLifeRing, faExclamationTriangle, faInfoCircle, faQuestionCircle,
      faShieldAlt, faLock, faKey
    ]
  },
  {
    key: 'files',
    name: 'files_icons',
    icons: [
      faFileCode, faFileArchive, faFileContract, faFileInvoice, faFileSignature,
      faFileDownload, faFileUpload, faFileImport, faFileExport, faFileCsv, faFileText, 
      faFile, faFolder, faFileAlt, faFilePdf, faFileWord, faFileExcel, 
      faFilePowerpoint, faFileImage, faFileVideo, faFileAudio
    ]
  }
];

// 为图标创建搜索关键词映射
const iconKeywords: Record<string, string[]> = {
  [faHeart.iconName]: ['heart', 'love', 'like', '心', '爱心', '喜欢'],
  [faStar.iconName]: ['star', 'favorite', 'rating', '星', '收藏', '评分'],
  [faHome.iconName]: ['home', 'house', '家', '首页'],
  [faUser.iconName]: ['user', 'person', 'profile', '用户', '人', '个人资料'],
  [faEnvelope.iconName]: ['mail', 'email', 'message', '邮件', '消息'],
  [faPhone.iconName]: ['phone', 'call', 'contact', '电话', '联系'],
  [faShoppingCart.iconName]: ['cart', 'shop', 'buy', '购物车', '商店', '购买'],
  [faPlay.iconName]: ['play', 'start', 'video', '播放', '开始', '视频'],
  [faMusic.iconName]: ['music', 'audio', 'sound', '音乐', '音频', '声音'],
  [faCamera.iconName]: ['camera', 'photo', 'picture', '相机', '照片', '图片'],
  [faGift.iconName]: ['gift', 'present', 'reward', '礼物', '奖励'],
  [faCheck.iconName]: ['check', 'ok', 'done', '检查', '确认', '完成'],
  [faBookmark.iconName]: ['bookmark', 'save', 'mark', '书签', '保存', '标记'],
  [faCoffee.iconName]: ['coffee', 'drink', 'cafe', '咖啡', '饮料'],
  [faGamepad.iconName]: ['game', 'play', 'gaming', '游戏', '娱乐'],
  [faChartBar.iconName]: ['chart', 'graph', 'analytics', '图表', '分析'],
  [faFile.iconName]: ['file', 'document', 'paper', '文件', '文档'],
  [faFolder.iconName]: ['folder', 'directory', '文件夹', '目录'],
  [faCogs.iconName]: ['settings', 'config', 'gear', '设置', '配置'],
  [faWrench.iconName]: ['tool', 'fix', 'repair', '工具', '修复'],
  [faRocket.iconName]: ['rocket', 'fast', 'launch', '火箭', '快速', '启动'],
  [faLightbulb.iconName]: ['idea', 'light', 'innovation', '想法', '创新'],
  [faDatabase.iconName]: ['database', 'data', 'storage', '数据库', '数据'],
  [faCode.iconName]: ['code', 'programming', 'developer', '代码', '编程'],
  [faBug.iconName]: ['bug', 'error', 'debug', '错误', '调试'],
  [faEdit.iconName]: ['edit', 'write', 'modify', '编辑', '修改'],
  [faCopy.iconName]: ['copy', 'duplicate', '复制'],
  [faTrash.iconName]: ['delete', 'remove', 'trash', '删除', '垃圾桶'],
  [faCloud.iconName]: ['cloud', 'online', 'storage', '云', '在线'],
  [faShieldAlt.iconName]: ['security', 'protect', 'safe', '安全', '保护'],
  [faLock.iconName]: ['lock', 'secure', 'private', '锁', '安全', '私有'],
  [faKey.iconName]: ['key', 'password', 'access', '钥匙', '密码', '访问'],
  [faGlobe.iconName]: ['world', 'global', 'internet', '世界', '全球', '网络'],
  [faWifi.iconName]: ['wifi', 'wireless', 'internet', '无线网络'],
  [faShare.iconName]: ['share', 'send', 'forward', '分享', '发送'],
  [faDownload.iconName]: ['download', 'save', '下载', '保存'],
  [faUpload.iconName]: ['upload', 'send', '上传', '发送'],
  [faBell.iconName]: ['notification', 'alert', 'bell', '通知', '提醒'],
  [faSearch.iconName]: ['search', 'find', 'look', '搜索', '查找'],
  [faCog.iconName]: ['setting', 'config', 'gear', '设置', '配置'],
  [faPlus.iconName]: ['add', 'plus', 'new', '添加', '新增'],
  [faMinus.iconName]: ['minus', 'remove', 'subtract', '减少', '删除'],
  [faTimes.iconName]: ['close', 'cancel', 'exit', '关闭', '取消'],
  [faSync.iconName]: ['refresh', 'reload', 'sync', '刷新', '同步'],
  [faSave.iconName]: ['save', 'store', 'keep', '保存', '存储'],
  [faPrint.iconName]: ['print', 'printer', '打印'],
  [faCalendar.iconName]: ['calendar', 'date', 'schedule', '日历', '日期'],
  [faClock.iconName]: ['time', 'clock', 'schedule', '时间', '时钟'],
  [faMapMarkerAlt.iconName]: ['location', 'place', 'map', '位置', '地点']
};

interface IconSelectorProps {
  selectedIcon: IconDefinition;
  onIconSelect: (icon: IconDefinition) => void;
}

export default function IconSelector({ selectedIcon, onIconSelect }: IconSelectorProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('popular');

  // 搜索过滤图标
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return iconCategories;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return iconCategories.map(category => ({
      ...category,
      icons: category.icons.filter(icon => {
        const keywords = iconKeywords[icon.iconName] || [];
        return keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ) || icon.iconName.toLowerCase().includes(searchLower);
      })
    })).filter(category => category.icons.length > 0);
  }, [searchTerm]);

  const styles = {
    container: "space-y-4",
    searchInput: "search-input w-full",
    categoryTabs: "flex flex-wrap gap-2 mb-4",
    categoryTab: "px-3 py-1 text-sm rounded-md cursor-pointer transition-colors",
    categoryTabActive: "px-3 py-1 text-sm rounded-md cursor-pointer transition-colors bg-purple-600 text-white",
    categoryTabInactive: "px-3 py-1 text-sm rounded-md cursor-pointer transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600",
    iconGrid: "grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2",
    iconButton: "btn-option p-3 flex items-center justify-center text-lg hover:scale-110 transition-transform",
    iconButtonActive: "btn-option-active p-3 flex items-center justify-center text-lg scale-110",
    categorySection: "mb-6",
    categoryTitle: "text-sm font-medium mb-3 text-secondary",
    noResults: "text-center text-gray-500 py-8"
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder={t('tools.icon_designer.icon_search_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {!searchTerm && (
        <div className={styles.categoryTabs}>
          {iconCategories.map((category) => (
            <button
              key={category.key}
              className={activeCategory === category.key ? styles.categoryTabActive : styles.categoryTabInactive}
              onClick={() => setActiveCategory(category.key)}
            >
              {t(`tools.icon_designer.${category.name}`)}
            </button>
          ))}
        </div>
      )}

      {filteredCategories.length === 0 ? (
        <div className={styles.noResults}>
          没有找到匹配的图标
        </div>
      ) : (
        <div>
          {searchTerm ? (
            // 搜索模式：显示所有匹配的分类
            filteredCategories.map((category) => (
              <div key={category.key} className={styles.categorySection}>
                <h4 className={styles.categoryTitle}>
                  {t(`tools.icon_designer.${category.name}`)} ({category.icons.length})
                </h4>
                <div className={styles.iconGrid}>
                  {category.icons.map((icon, index) => (
                    <button
                      key={`${category.key}-${index}`}
                      className={selectedIcon === icon ? styles.iconButtonActive : styles.iconButton}
                      onClick={() => onIconSelect(icon)}
                      title={icon.iconName}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // 分类模式：只显示当前激活的分类
            (() => {
              const currentCategory = iconCategories.find(cat => cat.key === activeCategory);
              return currentCategory ? (
                <div className={styles.iconGrid}>
                  {currentCategory.icons.map((icon, index) => (
                    <button
                      key={index}
                      className={selectedIcon === icon ? styles.iconButtonActive : styles.iconButton}
                      onClick={() => onIconSelect(icon)}
                      title={icon.iconName}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </button>
                  ))}
                </div>
              ) : null;
            })()
          )}
        </div>
      )}
    </div>
  );
} 