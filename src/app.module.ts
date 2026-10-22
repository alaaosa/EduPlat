import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { CourseModule } from './learning/course/course.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from './queue/queue.module';
import { InterceptorModule } from './interceptor/interceptor.module';
import { MuxModule } from './mux/mux.module';
import { RedisModule } from './redis/redis.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentModule } from './payment/payment.module';
import { GamificationModule } from './gamification/gamification.module';
import { DbModule } from './db/db.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { InstructerModule } from './instructer/instructer.module';
import { UserActivityModule } from './user_activity/user_activity.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { LearningModule } from './learning/learning.module';
import { PromotionModule } from './promotion/promotion.module';
import { CommunityModule } from './community/community.module';
import { CertificateModule } from './certificate/certificate.module';
import { LessonModule } from './lesson/lesson.module';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    DbModule,
    RedisModule,
    QueueModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    InterceptorModule,
    AuthModule,
    UserModule,
    AdminModule,
    CourseModule,
    NotificationModule,
    MuxModule,
    PaymentModule,
    CheckoutModule,
    GamificationModule,
    InstructerModule,
    UserActivityModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      context: ({ req }) => ({ req }),
    }),
    LearningModule,
    PromotionModule,
    CommunityModule,
    CertificateModule,
    LessonModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
