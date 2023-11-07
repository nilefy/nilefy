# Authorization

Authorization is the process of granting or denying access to resources or actions to a user, application, or system based on their identity and permissions. It is a crucial component of security and access control in various systems, such as computer networks, web applications, and databases.

## Key Concepts

Authentication vs. Authorization:

Authentication is the process of verifying the identity of a user or system. It confirms that the entity attempting access is who it claims to be.
Authorization, on the other hand, determines what actions or resources an authenticated entity is allowed to access based on their permissions.
Permission:

Permissions define what actions or resources a user or system is allowed to access. They are typically associated with roles or users and are used to enforce access control policies.

## what kind of authorization

check the difference between `RBAC` and `PBAC` here [https://rublon.com/blog/pbac-vs-rbac-whats-the-difference/](https://rublon.com/blog/pbac-vs-rbac-whats-the-difference/)

simply RBAC depends on having static roles like ['admin', 'user', 'visitor', ...]

PBAC depends on dynamically determines what a user can or cannot do based on policies and rules(or you can say permissions).

**What we use?** combination of both, as a developer of the app you interact with policies/permissions directly you don't care what roles user has, we only care does these roles have enough permissions.

by other words `roles`/`groups` are just user concept so that admin could control user permissions just a lil bit easier, like give user more than one permission with one role, or give more than one user the same roles 

the following image describe the relation between permissions/roles/groups

![auth](/apps/backend/docs/auth.png)

## should we store permissions on JWT

Let's have a look at the description jwt.io provides on when to use JWTs:

> Authorization: This is the most common scenario for using JWT. Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token. Single Sign On is a feature that widely uses JWT nowadays, because of its small overhead and its ability to be easily used across different domains.

That means that you need to generate the token on the server side once the user logs in.

It contains:

The user (as an id or name)
The roles the client has (user, admin, guest, whatsoever...)

that's looks good, we won't do database check with every request, because we have the JWT guarantee that it won't be changed by any party that don't have our secret

but let's look at what problems this approach introduce

### what if user permissions changed

with JWT you don't have to make request to the database you have user id, permissions everything you need in the payload.

but what if admin changed user permissions, this user will send old permissions payload, so they could have more or less privileges than the admin wants, SECURITY HAZARD!!!

### Solutions

- [https://stackoverflow.com/questions/51507978/is-it-more-efficient-to-store-the-permissions-of-the-user-in-an-jwt-claim-or-to](https://stackoverflow.com/questions/51507978/is-it-more-efficient-to-store-the-permissions-of-the-user-in-an-jwt-claim-or-to)

- [https://stackoverflow.com/questions/46454207/how-to-deal-with-changing-permissions-with-jwts](https://stackoverflow.com/questions/46454207/how-to-deal-with-changing-permissions-with-jwts)

- [https://dev.to/sebastiandg7/how-do-you-handle-role-permissions-updates-with-jwt-3778](https://dev.to/sebastiandg7/how-do-you-handle-role-permissions-updates-with-jwt-3778)

simplest one is to check permissions from database with every request, we will go with this for now as it's easy to implement!

## how to add new permission

## how to remove permission

## what is the difference between admin and superadmin
