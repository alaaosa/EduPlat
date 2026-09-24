// each value must be trim
export enum CourseCategory {
  DEVELOPMENT = 'Development',
  BUSINESS = 'Business',
  FINANCE_ACCOUNTING = 'FinanceAndAccounting',
  IT_SOFTWARE = 'ITSoftware',
  OFFICE_PRODUCTIVITY = 'Office Productivity',
  PERSONAL_DEVELOPMENT = 'Personal Development',
  DESIGN = 'Design',
  MARKETING = 'Marketing',
  LIFESTYLE = 'Lifestyle',
  PHOTOGRAPHY_VIDEO = 'Photography & Video',
  HEALTH_FITNESS = 'Health & Fitness',
  MUSIC = 'Music',
  TEACHING_ACADEMICS = 'Teaching & Academics',
  OTHER = 'Other',
}

export enum CourseStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
  REJECTED = 'Rejected',
  PENDING_REVIEW = 'Pending_Review',
  DELETED = 'deleted',
}

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ALL = 'All.Levels',
}

export enum CourseLanguage {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
}

export enum CertificateType {
  ATTENDANCE = 'attendance',
  COMPELETION = 'compeletion',
}
