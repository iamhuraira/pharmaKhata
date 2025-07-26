export enum ArticleStatus {
  PENDING = "pending",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
}

export enum KeywordStatus {
  USED = "used",
  UNUSED = "unused",
}

export enum UserStatus {
  ACTIVE = "active", // Active user
  DELETED = "deleted", // Deleted user itself
  BLOCKED = "blocked", // Blocked by admin
}

export enum UserRoles {
  ADMIN = "admin",
  SUB_ADMIN = "subAdmin",
  USER = "user",
}

export enum WorkspaceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum HeadingType {
  H1 = "H1",
  H2 = "H2",
  H3 = "H3",
  H4 = "H4",
  H5 = "H5",
}
