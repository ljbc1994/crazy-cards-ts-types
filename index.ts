// ====
type Count<A, S extends 0[] = []> = A extends S['length'] ? S : Count<A, [...S, 0]>
type Add<A, B> = [...Count<A>, ...Count<B>]['length']
type Min<A, B, C extends 0[] = []> = C['length'] extends A
  ? B
  : C['length'] extends B
  ? A
  : Min<A, B, [0, ...C]>
// ====

type Cards = {
  anywhere: { creditAvailable: 10 },
  liquid: { creditAvailable: 30 },
  student: { creditAvailable: 120 },
}
type CardKeys = keyof Cards

type Rule = { card: CardKeys; rule?: { employment?: string; income?: number } }
type AnywhereCardRule = { card: 'anywhere'; rule: never }
type LiquidCardRule = { card: 'liquid'; rule: { income: 20 } }
type StudentCardRule = { card: 'student'; rule: { employment: 'student' } }

type Rules = [LiquidCardRule, StudentCardRule, AnywhereCardRule]

type ProcessRule<
  TRuleToProcess extends Rule,
  TEmployment extends string,
  TIncome extends number,
  TResult extends string[],
  > = 
  TRuleToProcess['rule'] extends { income: number }
  ? Min<TIncome, TRuleToProcess['rule']['income']> extends TIncome
  ? [TRuleToProcess['card'], ...TResult]
  : TResult
  : TRuleToProcess['rule'] extends { employment: string }
  ? TRuleToProcess['rule']['employment'] extends TEmployment
  ? [TRuleToProcess['card'], ...TResult]
  : TRuleToProcess['rule'] extends never
  ? [TRuleToProcess['card'], ...TResult]
  : TRuleToProcess['rule'] extends { income: number, employment: string }
  ? Min<TIncome, TRuleToProcess['rule']['income']> extends TIncome
  ? [TRuleToProcess['card'], ...TResult] 
  : TRuleToProcess['rule']['employment'] extends TEmployment
  ? [TRuleToProcess['card'], ...TResult]
  : TResult  
  : TResult
  : TResult

type ProcessRules<
  TRulesToProcess extends Rule[],
  TEmployment extends string,
  TIncome extends number,
  TResult extends string[] = []
  > = TRulesToProcess extends [infer FirstRule, ...infer TailRules]
  ? TailRules extends Rule[]
  ? FirstRule extends Rule
  ? ProcessRule<
    FirstRule,
    TEmployment,
    TIncome,
    ProcessRules<TailRules, TEmployment, TIncome, TResult>
  >
  : TResult
  : TResult
  : TResult

type GetAvailableCards<Employment extends string, Income extends number> =
  ProcessRules<Rules, Employment, Income>

type ToCardMessage<Cards extends string[], Result extends string = ''> =
  Cards extends [infer FirstCard, ...infer TailCards]
  ? TailCards extends string[]
  ? FirstCard extends string
  ? TailCards['length'] extends 1
  ? `${FirstCard} and ${ToCardMessage<TailCards, Result>}`
  : `${FirstCard}, ${ToCardMessage<TailCards, Result>}`
  : Result
  : Result
  : Result

type ToFriendlyMessage<Cards extends string[]> =
  Cards['length'] extends 0
  ? `You have 0 cards available`
  : Cards['length'] extends 1
  ? `You have 1 card available - ${ToCardMessage<Cards>}`
  : `You have multiple cards available - ${ToCardMessage<Cards>}`

type GetAvailableCredit<TCards extends CardKeys[], Result extends number = 0> = 
  TCards extends [infer FirstCard, ...infer TailCards]
    ? TailCards extends CardKeys[]
      ? FirstCard extends CardKeys
        ? Add<Cards[FirstCard]['creditAvailable'], GetAvailableCredit<TailCards>>
        : Result
      : Result
    : Result

type GetAvailableCardsMessage<Employment extends string, Income extends number, AvailableCards extends CardKeys[] = GetAvailableCards<Employment, Income>> =
  `${ToFriendlyMessage<AvailableCards>}  available credit is £${GetAvailableCredit<AvailableCards>}`

/**
 * Change `GetAvailableCardsMessage<'student', 21>`
 * First Param: Employment type
 * Second Param: Income
 */
type FriendlyMessage = GetAvailableCardsMessage<'student', 21>
//      ^?
