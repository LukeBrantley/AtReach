import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const members=sqliteTable('members',{id:text('id').primaryKey(),payload:text('payload').notNull()});
export const cases=sqliteTable('cases',{id:text('id').primaryKey(),memberId:text('member_id').notNull().references(()=>members.id),payload:text('payload').notNull(),revision:integer('revision').notNull().default(0)},t=>[index('cases_member_idx').on(t.memberId)]);
