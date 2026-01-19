# Schema Migration Fixes Guide

## Schema Changes Summary

The schema has been refactored so that:
- **Medal** now only has `petId` (not `dogId`/`catId`)
- **Medal** has a `pet` relation (not `dog`/`cat` relations)
- **Pet** is the main entity with `name`, `petName`, `image`, `description`, `phoneNumber`
- **Pet** has optional `dogId` and `catId` fields pointing to `Dog`/`Cat`
- **Dog** and **Cat** only have `breed` and `size` (no `name`, `image`, etc.)
- **Callejero** only relates to `Pet` (not to `Dog`/`Cat`)

## Common Fix Patterns

### 1. Medal Includes
**OLD:**
```typescript
include: {
  dog: true,
  cat: true,
  pet: true
}
```

**NEW:**
```typescript
include: {
  pet: {
    include: {
      dog: true,
      cat: true
    }
  }
}
```

### 2. Accessing Animal Data
**OLD:**
```typescript
const animal = medal.dog || medal.cat || medal.pet;
const name = animal?.name;
```

**NEW:**
```typescript
const pet = medal.pet;
const name = pet?.petName || pet?.name;
const dog = pet?.dog;
const cat = pet?.cat;
```

### 3. Medal Fields
**OLD:**
```typescript
medal.dogId
medal.catId
```

**NEW:**
```typescript
medal.petId
medal.pet?.dogId
medal.pet?.catId
```

### 4. Creating Dog/Cat
**OLD:**
```typescript
await prisma.dog.create({
  data: {
    name: 'Fido',
    breed: 'Labrador',
    size: 'Large'
  }
});
```

**NEW:**
```typescript
// First create Pet
const pet = await prisma.pet.create({
  data: {
    name: 'Fido',
    petName: 'Fido',
    type: PetType.DOG
  }
});

// Then create Dog
const dog = await prisma.dog.create({
  data: {
    breed: 'Labrador',
    size: 'Large'
  }
});

// Link them
await prisma.pet.update({
  where: { id: pet.id },
  data: { dogId: dog.id, type: PetType.DOG }
});
```

### 5. Medal Updates
**OLD:**
```typescript
await prisma.medal.update({
  where: { id: medalId },
  data: { dogId: dog.id }
});
```

**NEW:**
```typescript
await prisma.medal.update({
  where: { id: medalId },
  data: { petId: pet.id }
});
```

### 6. Callejero Relations
**OLD:**
```typescript
dog.callejero
cat.callejero
```

**NEW:**
```typescript
pet.callejero
```

### 7. Where Clauses
**OLD:**
```typescript
where: { dogId: { not: null } }
where: { catId: { not: null } }
where: { callejeroId: { not: null } } // on Dog/Cat
```

**NEW:**
```typescript
where: { pet: { dogId: { not: null } } }
where: { pet: { catId: { not: null } } }
where: { pet: { callejeroId: { not: null } } }
```

### 8. Callejero Includes
**OLD:**
```typescript
include: {
  dog: true,
  cat: true
}
```

**NEW:**
```typescript
include: {
  pet: {
    include: {
      dog: true,
      cat: true
    }
  }
}
```

## Files That Need Updates

### Critical Service Files (Should be fixed):
- ✅ `src/pets/pets.service.ts` - Fixed
- ⚠️ `src/qr-checking/qr-checking.service.ts` - Structure looks correct, may need TypeScript restart

### Scripts That Need Updates:
- `scripts/check-medal.ts` - Partially fixed, may need owner include
- `scripts/check-pets-after-migration.ts`
- `scripts/classify-pets-batch.ts`
- `scripts/classify-pets-from-images.ts`
- `scripts/classify-pets-interactive.ts`
- `scripts/clean-medal.ts`
- `scripts/clean-user-complete.ts`
- `scripts/test-endpoint-direct.ts`
- `scripts/test-flow-without-register-process.ts`
- `scripts/test-get-pet.ts`
- `scripts/verify-migration.ts`
- `scripts/verify-pets-data.ts`

## Quick Fix Checklist

For each script file:
1. ✅ Change Medal includes from `dog: true, cat: true` to `pet: { include: { dog: true, cat: true } }`
2. ✅ Change `medal.dog`/`medal.cat` to `medal.pet.dog`/`medal.pet.cat`
3. ✅ Remove `medal.dogId`/`medal.catId` (use `medal.pet.dogId`/`medal.pet.catId` if needed)
4. ✅ Remove `name` field from Dog/Cat creation
5. ✅ Change `dog.callejero`/`cat.callejero` to `pet.callejero`
6. ✅ Update Medal where clauses to use `pet.dogId`/`pet.catId` instead of direct fields
7. ✅ Add `owner: true` to Medal includes if accessing `medal.owner`
8. ✅ Import `PetType` enum if using it
