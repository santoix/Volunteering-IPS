# VolunteeringIPS Doc
Manual Técnico do VolunteeringIPS

## Version: 1.0.0

### /email/notify

#### POST
##### Summary:

Used to send an email to an user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| notification | body | The notification to create | No | [Notification](#notification) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Email successfully sent |
| 401 | Email not sent due to unauthorization (invalid token) |

### /auth/login

#### POST
##### Summary:

Used to login with an user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| login | body | Login to be made | No | [Login](#login) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Login successfull! |
| 400 | Bad request. |
| 401 | The account is inactive. |
| 404 | Incorrect email or password. |

### /credentials/forgot

#### POST
##### Summary:

Used to send an email when the user forgets his account's password

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| forgot | body | Email to reset the password and his notification after | No | [Forgot](#forgot) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Request successefully sent |
| 400 | Bad request. |
| 403 | Non existent email |

### /credentials/reset

#### PATCH
##### Summary:

Used to reset the password, when forgotten by the user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| reset | body | This will only work if a 'forgot request' was made before | No | [Reset](#reset) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Account's password successfully changed |
| 400 | Passwords aren't the same |
| 404 | Probably the Forgot Request was not made |

### /credentials/confirmAccount/{token}

#### GET
##### Summary:

Used to activate the account

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| token | path | Generated token | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Account's activation done successfully |
| 400 | Invalid token! |

### /credentials/isLoggedIn

#### GET
##### Summary:

Used to see if the user is logged in

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You're logged |
| 401 | Not logged or inactive account |

### /credentials/hasAccess

#### GET
##### Summary:

Used to see if the user has access to a certain page

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You have access |
| 401 | You dont have access to this page |

### /credentials/logout

#### GET
##### Summary:

Used to logout an user

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You have logged out successfully (token cleared) |

### /user

#### GET
##### Summary:

Get all users

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

#### POST
##### Summary:

Add an user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| addUser | body | Insert all the information about the user | No | [User](#user) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Request successefully sent |
| 400 | Empty fields,  phone number or email already in DB, RGPD not accepted or error on saving data! |
| 403 | You are not an IPS community member |

### /user/setImage/{email}

#### POST
##### Summary:

Insert an image into an user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| email | path | User email | Yes | string |
| file | formData | Image to be inserted | No | file |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Request successefully sent |
| 400 | Bad request. |
| 403 | Non existent email |

### /user/details/{id}

#### GET
##### Summary:

Get one user by is id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | User id | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |
| 404 | User not found |

### /user/delete/{id}

#### DELETE
##### Summary:

Deletes one user by is id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | User id | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | User successfully deleted |
| 404 | User not found |

### /user/update/{id}

#### PUT
##### Summary:

Edit an user

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | User id | Yes | string |
| updateUser | body | Updates all the information about the user | No | [UpdateUser](#updateuser) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | User successefully updated |
| 400 | Phone number or email already in DB! |
| 404 | User not found |

### /user/updatePassword/{id}

#### PUT
##### Summary:

Updates an existing password

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | User id | Yes | string |
| updatePassword | body | First password is the actual one, the second is the new one | No | [PasswordChange](#passwordchange) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | User successefully updated |
| 400 | Old Password is not matching the existing one |
| 404 | User not found |

### /user/memberType

#### GET
##### Summary:

Get all member types

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

### /user/degree

#### GET
##### Summary:

Get all degrees

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

### /user/areasInterests

#### GET
##### Summary:

Get all areas of interest

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

### /user/reasons

#### GET
##### Summary:

Get all reasons

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

### /user/portugalCounty

#### GET
##### Summary:

Get all Portugal countys

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | You successfuly got the information |

### Models


#### Notification

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| auth | string |  | No |
| action | string |  | Yes |
| recipient | string |  | No |
| params | object |  | No |

#### Login

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| email | string |  | Yes |
| password | string |  | Yes |

#### Forgot

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| email | string |  | Yes |
| action | string |  | Yes |

#### Reset

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| password | string |  | Yes |
| confirmPassword | string |  | Yes |

#### User

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| firstName | string |  | No |
| lastName | string |  | No |
| email | string |  | No |
| password | string |  | No |
| phoneNumber | string |  | No |
| isVolunteer | boolean |  | No |
| communityMemberType | string |  | No |
| county | string |  | No |
| dateOfBirth | string |  | No |
| schoolOrService | string |  | No |
| degree | string |  | No |
| areasOfInterest | [ string ] |  | No |
| reasons | [ string ] |  | No |
| RGPD | boolean |  | No |
| role | string |  | No |
| isInactive | boolean |  | No |
| byAdmin | boolean |  | No |

#### UpdateUser

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| firstName | string |  | No |
| lastName | string |  | No |
| email | string |  | No |
| phoneNumber | string |  | No |
| isVolunteer | boolean |  | No |
| communityMemberType | string |  | No |
| county | string |  | No |
| dateOfBirth | string |  | No |
| schoolOrService | string |  | No |
| degree | string |  | No |
| areasOfInterest | [ string ] |  | No |
| reasons | [ string ] |  | No |
| RGPD | boolean |  | No |
| role | string |  | No |
| isInactive | boolean |  | No |
| byAdmin | boolean |  | No |

#### PasswordChange

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| oldPassword | string |  | No |
| newPassword | string |  | No |