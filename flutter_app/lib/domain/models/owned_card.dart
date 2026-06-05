import 'package:flutter/material.dart';
import 'enums.dart';

/// Note de gradation : maison + score (null si brute).
@immutable
class Grade {
  const Grade({required this.company, this.score});
  final GradingCompany company;
  final num? score;

  bool get isGraded => company != GradingCompany.raw && score != null;
}

/// Exemplaire effectivement possédé par l'utilisateur. On peut posséder
/// plusieurs exemplaires d'une même carte dans des états différents.
@immutable
class OwnedCard {
  const OwnedCard({
    required this.uid,
    required this.cardId,
    required this.condition,
    required this.grade,
    required this.acquiredCents,
    required this.acquiredAt,
    required this.binderIds,
    required this.favorite,
  });

  final String uid;
  final String cardId;
  final Condition condition;
  final Grade grade;
  final int acquiredCents;
  final DateTime acquiredAt;
  final List<String> binderIds;
  final bool favorite;

  OwnedCard copyWith({
    Condition? condition,
    Grade? grade,
    List<String>? binderIds,
    bool? favorite,
  }) {
    return OwnedCard(
      uid: uid,
      cardId: cardId,
      condition: condition ?? this.condition,
      grade: grade ?? this.grade,
      acquiredCents: acquiredCents,
      acquiredAt: acquiredAt,
      binderIds: binderIds ?? this.binderIds,
      favorite: favorite ?? this.favorite,
    );
  }

  /// Libellé court de gradation/état pour les badges.
  String get gradeLabel =>
      grade.isGraded ? '${grade.company.label} ${grade.score}' : condition.short;
}

/// Classeur personnalisé de rangement.
@immutable
class Binder {
  const Binder({
    required this.id,
    required this.name,
    required this.icon,
    required this.accent,
  });

  final String id;
  final String name;
  final String icon;
  final Color accent;
}
