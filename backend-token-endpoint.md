# Backend Token Endpoint

AgentStart'taki giriş sistemi için backend'de aşağıdaki endpoint'i eklemeniz gerekiyor:

## 1. Auth Controller'a Token Endpoint Ekle

`src/controllers/authController.ts` dosyasına ekleyin:

```typescript
export const handleGoogleToken = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      throw new ApiError(400, 'Access token is required');
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new ApiError(401, 'Invalid access token');
    }

    const userInfo = await userInfoResponse.json();

    // Find or create user in database
    let user = await db.query.users.findFirst({
      where: eq(users.googleId, userInfo.sub),
    });

    if (!user) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      }).returning();
      user = newUser;
    } else {
      // Update existing user
      const [updatedUser] = await db.update(users)
        .set({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    }

    // Create session
    req.session.userId = user.id;
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    handleApiError(error, res);
  }
};
```

## 2. Auth Routes'a Endpoint Ekle

`src/routes/authRoutes.ts` dosyasına ekleyin:

```typescript
router.post('/google/token', handleGoogleToken);
```

## 3. Import'ları Ekle

`src/controllers/authController.ts` dosyasının başına ekleyin:

```typescript
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
```

Bu endpoint sayesinde:
1. Frontend Google OAuth token'ını backend'e gönderir
2. Backend token'ı doğrular ve kullanıcı bilgilerini alır
3. Kullanıcıyı veritabanında bulur veya oluşturur
4. Session oluşturur
5. Kullanıcı bilgilerini döner

Bu şekilde AgentStart'taki giriş sistemi header'daki gibi çalışacak ve redirect_uri_mismatch hatası olmayacak. 